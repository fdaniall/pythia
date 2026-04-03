#[test_only]
module pythia::prediction_market_tests {
    use std::signer;
    use std::string;

    use initia_std::block;
    use initia_std::fungible_asset;
    use initia_std::primary_fungible_store;
    use initia_std::object;

    use pythia::prediction_market;

    // -- Test helpers --
    // Test token has max supply = 100. Each user gets 30.

    fun setup_test(admin: &signer, user1: &signer, user2: &signer) {
        block::set_block_info(1, 1000);

        let (creator_ref, token_obj) = fungible_asset::create_test_token(admin);
        let (mint_ref, _transfer_ref, _burn_ref) =
            primary_fungible_store::init_test_metadata_with_primary_store_enabled(&creator_ref);

        let metadata = object::convert(token_obj);

        primary_fungible_store::mint(&mint_ref, signer::address_of(admin), 30);
        primary_fungible_store::mint(&mint_ref, signer::address_of(user1), 30);
        primary_fungible_store::mint(&mint_ref, signer::address_of(user2), 30);

        prediction_market::init_module_for_test(admin, metadata);
    }

    // ================================================================
    // Create Market Tests
    // ================================================================

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    fun test_create_market(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);

        prediction_market::create_market(&admin, string::utf8(b"Will BTC hit 100K?"), 2000);

        assert!(prediction_market::get_market_count() == 1, 1);
        let (question, deadline, yes_pool, no_pool, resolved, _, creator, _, bettor_count) =
            prediction_market::get_market(0);

        assert!(question == string::utf8(b"Will BTC hit 100K?"), 2);
        assert!(deadline == 2000, 3);
        assert!(yes_pool == 0, 4);
        assert!(no_pool == 0, 5);
        assert!(!resolved, 6);
        assert!(creator == signer::address_of(&admin), 7);
        assert!(bettor_count == 0, 8);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    fun test_create_multiple_markets(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);

        prediction_market::create_market(&admin, string::utf8(b"M1"), 2000);
        prediction_market::create_market(&user1, string::utf8(b"M2"), 3000);
        prediction_market::create_market(&user2, string::utf8(b"M3"), 4000);

        assert!(prediction_market::get_market_count() == 3, 1);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    #[expected_failure(abort_code = 0x10005)]
    fun test_create_market_past_deadline(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::create_market(&admin, string::utf8(b"Past"), 500);
    }

    // ================================================================
    // Place Bet Tests
    // ================================================================

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    fun test_place_bet_yes(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);

        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);
        prediction_market::place_bet(&user1, 0, 0, 10); // 10 YES

        let (_, _, yes_pool, no_pool, _, _, _, _, bettor_count) = prediction_market::get_market(0);
        assert!(yes_pool == 10, 1);
        assert!(no_pool == 0, 2);
        assert!(bettor_count == 1, 3);

        let (yes_amt, no_amt, claimed) = prediction_market::get_bet(0, signer::address_of(&user1));
        assert!(yes_amt == 10, 4);
        assert!(no_amt == 0, 5);
        assert!(!claimed, 6);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    fun test_place_bet_no(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);

        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);
        prediction_market::place_bet(&user1, 0, 1, 8); // 8 NO

        let (_, _, yes_pool, no_pool, _, _, _, _, _) = prediction_market::get_market(0);
        assert!(yes_pool == 0, 1);
        assert!(no_pool == 8, 2);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    fun test_place_bet_both_sides(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);

        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);
        prediction_market::place_bet(&user1, 0, 0, 10); // YES
        prediction_market::place_bet(&user1, 0, 1, 5);  // NO (same user)

        let (yes_amt, no_amt, _) = prediction_market::get_bet(0, signer::address_of(&user1));
        assert!(yes_amt == 10, 1);
        assert!(no_amt == 5, 2);

        let (_, _, _, _, _, _, _, _, bettor_count) = prediction_market::get_market(0);
        assert!(bettor_count == 1, 3);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    fun test_multiple_bettors(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);

        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);
        prediction_market::place_bet(&user1, 0, 0, 10);
        prediction_market::place_bet(&user2, 0, 1, 8);

        let (_, _, yes_pool, no_pool, _, _, _, _, bettor_count) = prediction_market::get_market(0);
        assert!(yes_pool == 10, 1);
        assert!(no_pool == 8, 2);
        assert!(bettor_count == 2, 3);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    #[expected_failure(abort_code = 0x10006)]
    fun test_place_bet_zero_amount(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);
        prediction_market::place_bet(&user1, 0, 0, 0);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    #[expected_failure(abort_code = 0x1000A)]
    fun test_place_bet_invalid_outcome(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);
        prediction_market::place_bet(&user1, 0, 2, 5);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    #[expected_failure(abort_code = 0x30004)]
    fun test_place_bet_expired_market(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);
        block::set_block_info(2, 3000);
        prediction_market::place_bet(&user1, 0, 0, 5);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    #[expected_failure(abort_code = 0x60001)]
    fun test_place_bet_nonexistent_market(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::place_bet(&user1, 99, 0, 5);
    }

    // ================================================================
    // Resolve Market Tests
    // ================================================================

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    fun test_resolve_market_yes(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);
        prediction_market::resolve_market(&admin, 0, 0);

        let (_, _, _, _, resolved, outcome, _, _, _) = prediction_market::get_market(0);
        assert!(resolved, 1);
        assert!(outcome == 0, 2);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    fun test_resolve_market_no(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);
        prediction_market::resolve_market(&admin, 0, 1);

        let (_, _, _, _, resolved, outcome, _, _, _) = prediction_market::get_market(0);
        assert!(resolved, 1);
        assert!(outcome == 1, 2);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    #[expected_failure(abort_code = 0x50009)]
    fun test_resolve_market_not_admin(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);
        prediction_market::resolve_market(&user1, 0, 0);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    #[expected_failure(abort_code = 0x30002)]
    fun test_resolve_market_twice(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);
        prediction_market::resolve_market(&admin, 0, 0);
        prediction_market::resolve_market(&admin, 0, 1);
    }

    // ================================================================
    // Claim Winnings Tests
    // ================================================================

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    fun test_claim_winnings_yes_wins(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);

        // user1: 20 YES, user2: 10 NO. Total pool = 30
        prediction_market::place_bet(&user1, 0, 0, 20);
        prediction_market::place_bet(&user2, 0, 1, 10);

        let user1_before = prediction_market::test_get_balance(signer::address_of(&user1));

        prediction_market::resolve_market(&admin, 0, 0); // YES wins
        prediction_market::claim_winnings(&user1, 0);

        let user1_after = prediction_market::test_get_balance(signer::address_of(&user1));

        // gross = (20 * 30) / 20 = 30
        // fee = 30 * 200 / 10000 = 0 (integer truncation at small amounts)
        // net = 30
        // profit = 30 - 0 = 30 credited (had 10 left after betting 20, now 10+30=40... wait)
        // user1 started with 30, bet 20, has 10. gets back 30-0=30. total = 40? No...
        // fee = 30 * 200 / 10000 = 0.6 -> truncated to 0 in integer math
        // net = 30 - 0 = 30
        // balance change = 30
        assert!(user1_after - user1_before == 30, 1);

        let (_, _, claimed) = prediction_market::get_bet(0, signer::address_of(&user1));
        assert!(claimed, 2);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    fun test_claim_winnings_no_wins(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);

        // user1: 10 YES, user2: 20 NO. Total pool = 30
        prediction_market::place_bet(&user1, 0, 0, 10);
        prediction_market::place_bet(&user2, 0, 1, 20);

        let user2_before = prediction_market::test_get_balance(signer::address_of(&user2));

        prediction_market::resolve_market(&admin, 0, 1); // NO wins
        prediction_market::claim_winnings(&user2, 0);

        let user2_after = prediction_market::test_get_balance(signer::address_of(&user2));

        // gross = (20 * 30) / 20 = 30, fee = 0 (truncated), net = 30
        assert!(user2_after - user2_before == 30, 1);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    fun test_proportional_payout(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);

        // user1: 6 YES, user2: 14 YES, admin: 20 NO
        // YES pool = 20, NO pool = 20, Total = 40
        prediction_market::place_bet(&user1, 0, 0, 6);
        prediction_market::place_bet(&user2, 0, 0, 14);
        prediction_market::place_bet(&admin, 0, 1, 20);

        let user1_before = prediction_market::test_get_balance(signer::address_of(&user1));
        let user2_before = prediction_market::test_get_balance(signer::address_of(&user2));

        prediction_market::resolve_market(&admin, 0, 0); // YES wins

        prediction_market::claim_winnings(&user1, 0);
        prediction_market::claim_winnings(&user2, 0);

        let user1_after = prediction_market::test_get_balance(signer::address_of(&user1));
        let user2_after = prediction_market::test_get_balance(signer::address_of(&user2));

        // user1: gross = 6 * 40 / 20 = 12, fee = 12*200/10000 = 0, net = 12
        // user2: gross = 14 * 40 / 20 = 28, fee = 28*200/10000 = 0, net = 28
        assert!(user1_after - user1_before == 12, 1);
        assert!(user2_after - user2_before == 28, 2);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    #[expected_failure(abort_code = 0x30008)]
    fun test_double_claim(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);
        prediction_market::place_bet(&user1, 0, 0, 10);
        prediction_market::place_bet(&user2, 0, 1, 10);
        prediction_market::resolve_market(&admin, 0, 0);
        prediction_market::claim_winnings(&user1, 0);
        prediction_market::claim_winnings(&user1, 0);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    #[expected_failure(abort_code = 0x30007)]
    fun test_claim_loser(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);
        prediction_market::place_bet(&user1, 0, 0, 10);
        prediction_market::place_bet(&user2, 0, 1, 10);
        prediction_market::resolve_market(&admin, 0, 1); // NO wins
        prediction_market::claim_winnings(&user1, 0); // user1 bet YES
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    #[expected_failure(abort_code = 0x30003)]
    fun test_claim_before_resolution(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);
        prediction_market::place_bet(&user1, 0, 0, 10);
        prediction_market::claim_winnings(&user1, 0);
    }

    // ================================================================
    // View Function Tests
    // ================================================================

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    fun test_calculate_payout(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);
        prediction_market::place_bet(&user1, 0, 0, 10);
        prediction_market::place_bet(&user2, 0, 1, 10);

        assert!(prediction_market::calculate_payout(0, signer::address_of(&user1)) == 0, 1);

        prediction_market::resolve_market(&admin, 0, 0);

        // gross = 10*20/10 = 20, fee = 0, net = 20
        let payout = prediction_market::calculate_payout(0, signer::address_of(&user1));
        assert!(payout == 20, 2);

        assert!(prediction_market::calculate_payout(0, signer::address_of(&user2)) == 0, 3);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    fun test_get_bet_no_bet(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);

        let (yes_amt, no_amt, claimed) = prediction_market::get_bet(0, signer::address_of(&user1));
        assert!(yes_amt == 0, 1);
        assert!(no_amt == 0, 2);
        assert!(!claimed, 3);
    }

    // ================================================================
    // Admin Function Tests
    // ================================================================

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    fun test_set_platform_fee(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::set_platform_fee(&admin, 500);
        assert!(prediction_market::get_platform_fee_bps() == 500, 1);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    #[expected_failure(abort_code = 0x50009)]
    fun test_set_platform_fee_not_admin(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::set_platform_fee(&user1, 500);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    #[expected_failure(abort_code = 0x1000B)]
    fun test_set_platform_fee_too_high(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::set_platform_fee(&admin, 1500);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    fun test_transfer_ownership(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::transfer_ownership(&admin, signer::address_of(&user1));
        assert!(prediction_market::get_admin() == signer::address_of(&user1), 1);
    }

    // ================================================================
    // Get Bettors Tests
    // ================================================================

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    fun test_get_bettors_empty(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);

        let bettors = prediction_market::get_bettors(0);
        assert!(std::vector::length(&bettors) == 0, 1);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    fun test_get_bettors_single(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);
        prediction_market::place_bet(&user1, 0, 0, 5);

        let bettors = prediction_market::get_bettors(0);
        assert!(std::vector::length(&bettors) == 1, 1);
        assert!(*std::vector::borrow(&bettors, 0) == signer::address_of(&user1), 2);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    fun test_get_bettors_multiple(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);
        prediction_market::place_bet(&user1, 0, 0, 5);
        prediction_market::place_bet(&user2, 0, 1, 8);
        // user1 bets again — should NOT duplicate in bettors list
        prediction_market::place_bet(&user1, 0, 1, 3);

        let bettors = prediction_market::get_bettors(0);
        assert!(std::vector::length(&bettors) == 2, 1);
    }

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    #[expected_failure(abort_code = 0x60001)]
    fun test_get_bettors_nonexistent_market(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::get_bettors(99);
    }

    // ================================================================
    // Bet on Resolved Market
    // ================================================================

    #[test(admin = @0x42, user1 = @0x100, user2 = @0x200)]
    #[expected_failure(abort_code = 0x30002)]
    fun test_bet_on_resolved_market(admin: signer, user1: signer, user2: signer) {
        setup_test(&admin, &user1, &user2);
        prediction_market::create_market(&admin, string::utf8(b"Test?"), 2000);
        prediction_market::resolve_market(&admin, 0, 0);
        prediction_market::place_bet(&user1, 0, 0, 5);
    }
}
