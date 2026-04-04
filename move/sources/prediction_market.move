/// Pythia Prediction Market - Binary prediction markets on Initia L1
/// Users create markets with a question + deadline, bet YES/NO with INIT tokens,
/// and claim proportional payouts after resolution. 2% platform fee on winnings.
module pythia::prediction_market {
    use std::signer;
    use std::error;
    use std::string::String;
    use std::vector;

    use initia_std::block;
    use initia_std::event;
    use initia_std::object::{Self, ExtendRef};
    use initia_std::table::{Self, Table};
    use initia_std::fungible_asset::Metadata;
    use initia_std::primary_fungible_store;
    use initia_std::coin;
    use initia_std::string as initia_string;

    //  Error Codes 
    const EMARKET_NOT_FOUND: u64 = 1;
    const EMARKET_ALREADY_RESOLVED: u64 = 2;
    const EMARKET_NOT_RESOLVED: u64 = 3;
    const EMARKET_EXPIRED: u64 = 4;
    const EINVALID_DEADLINE: u64 = 5;
    const EZERO_AMOUNT: u64 = 6;
    const ENOTHING_TO_CLAIM: u64 = 7;
    const EALREADY_CLAIMED: u64 = 8;
    const EUNAUTHORIZED: u64 = 9;
    const EINVALID_OUTCOME: u64 = 10;
    const EINVALID_FEE: u64 = 11;
    const ENO_PENDING_ADMIN: u64 = 12;
    const EMARKET_HAS_BETS: u64 = 13;

    //  Outcome Constants 
    const OUTCOME_YES: u8 = 0;
    const OUTCOME_NO: u8 = 1;

    //  Events 
    #[event]
    struct MarketCreated has drop, store {
        market_id: u64,
        question: String,
        deadline: u64,
        creator: address,
    }

    #[event]
    struct BetPlaced has drop, store {
        market_id: u64,
        bettor: address,
        outcome: u8,
        amount: u64,
    }

    #[event]
    struct MarketResolved has drop, store {
        market_id: u64,
        winning_outcome: u8,
    }

    #[event]
    struct WinningsClaimed has drop, store {
        market_id: u64,
        bettor: address,
        payout: u64,
    }

    //  Storage Structs 

    struct Bet has store, copy, drop {
        yes_amount: u64,
        no_amount: u64,
        claimed: bool,
    }

    struct Market has store {
        question: String,
        deadline: u64,
        total_yes_pool: u64,
        total_no_pool: u64,
        resolved: bool,
        winning_outcome: u8,
        creator: address,
        created_at: u64,
        bets: Table<address, Bet>,
        bettors: vector<address>,
    }

    struct State has key {
        admin: address,
        pending_admin: address,
        markets: Table<u64, Market>,
        market_count: u64,
        platform_fee_bps: u64,
        total_fees_collected: u64,
        total_fees_withdrawn: u64,
        extend_ref: ExtendRef,
        token_metadata: object::Object<Metadata>,
    }

    //  Init Module
    fun init_module(admin: &signer) {
        let admin_addr = signer::address_of(admin);

        // Create contract-owned object for holding funds
        let constructor_ref = object::create_object(admin_addr, false);
        let extend_ref = object::generate_extend_ref(&constructor_ref);

        // Use native token (umin on rollup, uinit on L1)
        let token_metadata = coin::metadata(@initia_std, initia_string::utf8(b"umin"));

        move_to(admin, State {
            admin: admin_addr,
            pending_admin: @0x0,
            markets: table::new(),
            market_count: 0,
            platform_fee_bps: 200, // 2%
            total_fees_collected: 0,
            total_fees_withdrawn: 0,
            extend_ref,
            token_metadata,
        });
    }

    //  Helper: Get token metadata from state
    fun get_token_metadata(): object::Object<Metadata> acquires State {
        borrow_global<State>(@pythia).token_metadata
    }

    //  Helper: Contract vault address
    fun vault_address(state: &State): address {
        object::address_from_extend_ref(&state.extend_ref)
    }

    //  Entry: Create Market 

    /// Create a new binary prediction market.
    /// Anyone can create a market  no admin permission needed.
    public entry fun create_market(
        creator: &signer,
        question: String,
        deadline: u64,
    ) acquires State {
        let now = block::get_current_block_timestamp();
        assert!(deadline > now, error::invalid_argument(EINVALID_DEADLINE));

        let state = borrow_global_mut<State>(@pythia);
        let market_id = state.market_count;
        state.market_count = market_id + 1;

        let creator_addr = signer::address_of(creator);

        let market = Market {
            question,
            deadline,
            total_yes_pool: 0,
            total_no_pool: 0,
            resolved: false,
            winning_outcome: 0,
            creator: creator_addr,
            created_at: now,
            bets: table::new(),
            bettors: vector::empty(),
        };

        table::add(&mut state.markets, market_id, market);

        event::emit(MarketCreated {
            market_id,
            question: table::borrow(&state.markets, market_id).question,
            deadline,
            creator: creator_addr,
        });
    }

    //  Entry: Place Bet 

    /// Place a bet on a market. outcome: 0 = YES, 1 = NO.
    /// INIT tokens are transferred from the bettor to the contract vault.
    public entry fun place_bet(
        bettor: &signer,
        market_id: u64,
        outcome: u8,
        amount: u64,
    ) acquires State {
        assert!(outcome == OUTCOME_YES || outcome == OUTCOME_NO, error::invalid_argument(EINVALID_OUTCOME));
        assert!(amount > 0, error::invalid_argument(EZERO_AMOUNT));

        // Read token metadata + vault addr before mutable borrow
        let metadata = get_token_metadata();
        let vault_addr = vault_address(borrow_global<State>(@pythia));

        // Transfer tokens from bettor to contract vault
        let fa = primary_fungible_store::withdraw(bettor, metadata, amount);
        primary_fungible_store::deposit(vault_addr, fa);

        let state = borrow_global_mut<State>(@pythia);
        assert!(table::contains(&state.markets, market_id), error::not_found(EMARKET_NOT_FOUND));

        let market = table::borrow_mut(&mut state.markets, market_id);
        assert!(!market.resolved, error::invalid_state(EMARKET_ALREADY_RESOLVED));

        let now = block::get_current_block_timestamp();
        assert!(now < market.deadline, error::invalid_state(EMARKET_EXPIRED));

        let bettor_addr = signer::address_of(bettor);

        // Record bet
        if (!table::contains(&market.bets, bettor_addr)) {
            vector::push_back(&mut market.bettors, bettor_addr);
            table::add(&mut market.bets, bettor_addr, Bet {
                yes_amount: 0,
                no_amount: 0,
                claimed: false,
            });
        };

        let bet = table::borrow_mut(&mut market.bets, bettor_addr);
        if (outcome == OUTCOME_YES) {
            bet.yes_amount = bet.yes_amount + amount;
            market.total_yes_pool = market.total_yes_pool + amount;
        } else {
            bet.no_amount = bet.no_amount + amount;
            market.total_no_pool = market.total_no_pool + amount;
        };

        event::emit(BetPlaced {
            market_id,
            bettor: bettor_addr,
            outcome,
            amount,
        });
    }

    //  Entry: Resolve Market 

    /// Resolve a market. Only the contract admin can resolve.
    /// winning_outcome: 0 = YES wins, 1 = NO wins.
    public entry fun resolve_market(
        admin: &signer,
        market_id: u64,
        winning_outcome: u8,
    ) acquires State {
        assert!(winning_outcome == OUTCOME_YES || winning_outcome == OUTCOME_NO, error::invalid_argument(EINVALID_OUTCOME));

        let state = borrow_global_mut<State>(@pythia);
        assert!(signer::address_of(admin) == state.admin, error::permission_denied(EUNAUTHORIZED));
        assert!(table::contains(&state.markets, market_id), error::not_found(EMARKET_NOT_FOUND));

        let market = table::borrow_mut(&mut state.markets, market_id);
        assert!(!market.resolved, error::invalid_state(EMARKET_ALREADY_RESOLVED));

        let now = block::get_current_block_timestamp();
        assert!(now >= market.deadline, error::invalid_state(EMARKET_EXPIRED));

        market.resolved = true;
        market.winning_outcome = winning_outcome;

        event::emit(MarketResolved {
            market_id,
            winning_outcome,
        });
    }

    //  Entry: Claim Winnings 

    /// Claim winnings from a resolved market.
    /// Payout = (user_winning_bet / winning_pool) * total_pool * (1 - fee)
    public entry fun claim_winnings(
        bettor: &signer,
        market_id: u64,
    ) acquires State {
        let bettor_addr = signer::address_of(bettor);

        // Step 1: Read immutably to compute payout
        let metadata = get_token_metadata();
        let net_payout: u64;
        let fee_amount: u64;
        {
            let state = borrow_global<State>(@pythia);
            assert!(table::contains(&state.markets, market_id), error::not_found(EMARKET_NOT_FOUND));

            let market = table::borrow(&state.markets, market_id);
            assert!(market.resolved, error::invalid_state(EMARKET_NOT_RESOLVED));
            assert!(table::contains(&market.bets, bettor_addr), error::not_found(ENOTHING_TO_CLAIM));

            let bet = table::borrow(&market.bets, bettor_addr);
            assert!(!bet.claimed, error::invalid_state(EALREADY_CLAIMED));

            let winning_amount = if (market.winning_outcome == OUTCOME_YES) {
                bet.yes_amount
            } else {
                bet.no_amount
            };
            assert!(winning_amount > 0, error::invalid_state(ENOTHING_TO_CLAIM));

            let total_pool = market.total_yes_pool + market.total_no_pool;
            let winning_pool = if (market.winning_outcome == OUTCOME_YES) {
                market.total_yes_pool
            } else {
                market.total_no_pool
            };

            let gross_payout = (winning_amount as u128) * (total_pool as u128) / (winning_pool as u128);
            let fee = gross_payout * (state.platform_fee_bps as u128) / 10000;
            fee_amount = (fee as u64);
            net_payout = ((gross_payout - fee) as u64);
        };

        // Step 2: Mark claimed + track fees (mutable borrow)
        {
            let state = borrow_global_mut<State>(@pythia);
            state.total_fees_collected = state.total_fees_collected + fee_amount;
            let market = table::borrow_mut(&mut state.markets, market_id);
            let bet = table::borrow_mut(&mut market.bets, bettor_addr);
            bet.claimed = true;
        };

        // Step 3: Transfer from vault to bettor
        {
            let state = borrow_global<State>(@pythia);
            let obj_signer = object::generate_signer_for_extending(&state.extend_ref);
            let fa = primary_fungible_store::withdraw(&obj_signer, metadata, net_payout);
            primary_fungible_store::deposit(bettor_addr, fa);
        };

        event::emit(WinningsClaimed {
            market_id,
            bettor: bettor_addr,
            payout: net_payout,
        });
    }

    //  Admin: Set Platform Fee 

    public entry fun set_platform_fee(
        admin: &signer,
        new_fee_bps: u64,
    ) acquires State {
        let state = borrow_global_mut<State>(@pythia);
        assert!(signer::address_of(admin) == state.admin, error::permission_denied(EUNAUTHORIZED));
        assert!(new_fee_bps <= 1000, error::invalid_argument(EINVALID_FEE)); // max 10%
        state.platform_fee_bps = new_fee_bps;
    }

    //  Admin: Transfer Ownership (Two-Step)

    /// Step 1: Current admin proposes a new admin.
    public entry fun propose_admin(
        admin: &signer,
        new_admin: address,
    ) acquires State {
        let state = borrow_global_mut<State>(@pythia);
        assert!(signer::address_of(admin) == state.admin, error::permission_denied(EUNAUTHORIZED));
        state.pending_admin = new_admin;
    }

    /// Step 2: Proposed admin accepts ownership.
    public entry fun accept_admin(
        new_admin: &signer,
    ) acquires State {
        let state = borrow_global_mut<State>(@pythia);
        let new_admin_addr = signer::address_of(new_admin);
        assert!(new_admin_addr == state.pending_admin, error::permission_denied(ENO_PENDING_ADMIN));
        state.admin = new_admin_addr;
        state.pending_admin = @0x0;
    }

    //  Admin: Cancel Market

    /// Cancel a market and refund all bettors. Only callable by admin.
    /// Market must not be resolved yet.
    public entry fun cancel_market(
        admin: &signer,
        market_id: u64,
    ) acquires State {
        let admin_addr = signer::address_of(admin);
        let metadata = get_token_metadata();

        // Collect refund info immutably
        let refunds: vector<address>;
        let refund_amounts: vector<u64>;
        {
            let state = borrow_global<State>(@pythia);
            assert!(admin_addr == state.admin, error::permission_denied(EUNAUTHORIZED));
            assert!(table::contains(&state.markets, market_id), error::not_found(EMARKET_NOT_FOUND));

            let market = table::borrow(&state.markets, market_id);
            assert!(!market.resolved, error::invalid_state(EMARKET_ALREADY_RESOLVED));

            refunds = market.bettors;
            refund_amounts = vector::empty();
            let i = 0;
            let len = vector::length(&refunds);
            while (i < len) {
                let addr = *vector::borrow(&refunds, i);
                let bet = table::borrow(&market.bets, addr);
                vector::push_back(&mut refund_amounts, bet.yes_amount + bet.no_amount);
                i = i + 1;
            };
        };

        // Mark market as resolved with a special "cancelled" state
        {
            let state = borrow_global_mut<State>(@pythia);
            let market = table::borrow_mut(&mut state.markets, market_id);
            market.resolved = true;
            market.winning_outcome = 255; // 255 = cancelled
        };

        // Process refunds from vault
        {
            let state = borrow_global<State>(@pythia);
            let obj_signer = object::generate_signer_for_extending(&state.extend_ref);
            let i = 0;
            let len = vector::length(&refunds);
            while (i < len) {
                let addr = *vector::borrow(&refunds, i);
                let amount = *vector::borrow(&refund_amounts, i);
                if (amount > 0) {
                    let fa = primary_fungible_store::withdraw(&obj_signer, metadata, amount);
                    primary_fungible_store::deposit(addr, fa);
                };
                i = i + 1;
            };
        };
    }

    //  Admin: Withdraw Fees 

    public entry fun withdraw_fees(
        admin: &signer,
        amount: u64,
    ) acquires State {
        let admin_addr = signer::address_of(admin);
        let metadata = get_token_metadata();

        // Auth check + verify withdrawable amount
        {
            let state = borrow_global<State>(@pythia);
            assert!(admin_addr == state.admin, error::permission_denied(EUNAUTHORIZED));
            let available = state.total_fees_collected - state.total_fees_withdrawn;
            assert!(amount <= available, error::invalid_argument(EZERO_AMOUNT));
        };

        // Track withdrawal
        {
            let state = borrow_global_mut<State>(@pythia);
            state.total_fees_withdrawn = state.total_fees_withdrawn + amount;
        };

        // Transfer fees to admin
        {
            let state = borrow_global<State>(@pythia);
            let obj_signer = object::generate_signer_for_extending(&state.extend_ref);
            let fa = primary_fungible_store::withdraw(&obj_signer, metadata, amount);
            primary_fungible_store::deposit(admin_addr, fa);
        };
    }

    //  View Functions 

    #[view]
    public fun get_market_count(): u64 acquires State {
        borrow_global<State>(@pythia).market_count
    }

    #[view]
    public fun get_market(market_id: u64): (
        String, // question
        u64,    // deadline
        u64,    // total_yes_pool
        u64,    // total_no_pool
        bool,   // resolved
        u8,     // winning_outcome
        address, // creator
        u64,    // created_at
        u64,    // bettor_count
    ) acquires State {
        let state = borrow_global<State>(@pythia);
        assert!(table::contains(&state.markets, market_id), error::not_found(EMARKET_NOT_FOUND));

        let market = table::borrow(&state.markets, market_id);
        (
            market.question,
            market.deadline,
            market.total_yes_pool,
            market.total_no_pool,
            market.resolved,
            market.winning_outcome,
            market.creator,
            market.created_at,
            vector::length(&market.bettors),
        )
    }

    #[view]
    public fun get_bet(market_id: u64, bettor: address): (u64, u64, bool) acquires State {
        let state = borrow_global<State>(@pythia);
        assert!(table::contains(&state.markets, market_id), error::not_found(EMARKET_NOT_FOUND));

        let market = table::borrow(&state.markets, market_id);
        if (!table::contains(&market.bets, bettor)) {
            return (0, 0, false)
        };

        let bet = table::borrow(&market.bets, bettor);
        (bet.yes_amount, bet.no_amount, bet.claimed)
    }

    #[view]
    public fun calculate_payout(market_id: u64, bettor: address): u64 acquires State {
        let state = borrow_global<State>(@pythia);
        assert!(table::contains(&state.markets, market_id), error::not_found(EMARKET_NOT_FOUND));

        let market = table::borrow(&state.markets, market_id);
        if (!market.resolved) return 0;
        if (!table::contains(&market.bets, bettor)) return 0;

        let bet = table::borrow(&market.bets, bettor);
        let winning_amount = if (market.winning_outcome == OUTCOME_YES) {
            bet.yes_amount
        } else {
            bet.no_amount
        };
        if (winning_amount == 0) return 0;

        let total_pool = market.total_yes_pool + market.total_no_pool;
        let winning_pool = if (market.winning_outcome == OUTCOME_YES) {
            market.total_yes_pool
        } else {
            market.total_no_pool
        };

        let gross_payout = (winning_amount as u128) * (total_pool as u128) / (winning_pool as u128);
        let fee = gross_payout * (state.platform_fee_bps as u128) / 10000;
        ((gross_payout - fee) as u64)
    }

    #[view]
    public fun get_platform_fee_bps(): u64 acquires State {
        borrow_global<State>(@pythia).platform_fee_bps
    }

    #[view]
    public fun get_admin(): address acquires State {
        borrow_global<State>(@pythia).admin
    }

    /// Returns the list of bettor addresses for a given market.
    #[view]
    public fun get_bettors(market_id: u64): vector<address> acquires State {
        let state = borrow_global<State>(@pythia);
        assert!(table::contains(&state.markets, market_id), error::not_found(EMARKET_NOT_FOUND));

        let market = table::borrow(&state.markets, market_id);
        market.bettors
    }

    // -- Test-only helpers --

    #[test_only]
    public fun init_module_for_test(admin: &signer, token_metadata: object::Object<Metadata>) {
        let admin_addr = signer::address_of(admin);
        let constructor_ref = object::create_object(admin_addr, false);
        let extend_ref = object::generate_extend_ref(&constructor_ref);

        move_to(admin, State {
            admin: admin_addr,
            markets: table::new(),
            market_count: 0,
            platform_fee_bps: 200,
            total_fees_collected: 0,
            total_fees_withdrawn: 0,
            extend_ref,
            token_metadata,
        });
    }

    #[test_only]
    public fun test_get_balance(addr: address): u64 acquires State {
        let metadata = get_token_metadata();
        primary_fungible_store::balance(addr, metadata)
    }
}
