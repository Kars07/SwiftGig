#[test_only]
module swiftgig::swiftgig_tests;

use swiftgig::swiftgig::{Self, SwiftGigRegistry, Gig, Poll, TalentProfile, ClientProfile};
use swiftgig::swiftgig::Preferred;
use sui::test_scenario::{Self, Scenario};
use sui::clock::{Self, Clock};
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::balance;
use sui::test_utils;
use std::string;
use std::option;

// Test addresses
const ADMIN: address = @0xCAFE;
const CLIENT1: address = @0xBEEF;
const CLIENT2: address = @0xDEAD;
const TALENT1: address = @0xBEEFCAFE;
const TALENT2: address = @0xBEEFDEAD;
const TALENT3: address = @0xBEEF1234;
const VOTER1: address = @0xBEEF12;
const VOTER2: address = @0xBEEF5678;

// Test constants
const REWARD_AMOUNT: u64 = 1000000000; // 1 SUI
const DEADLINE_OFFSET: u64 = 86400000; // 24 hours in ms
const ACTIVE_TIMEFRAME: u64 = 3600000; // 1 hour in ms



#[test]
fun test_initialize_registry() {
    let mut scenario = test_scenario::begin(ADMIN);
    
    // Initialize registry
    {
        swiftgig::initialize_registry(test_scenario::ctx(&mut scenario));
    };
    
    // Check registry exists
    test_scenario::next_tx(&mut scenario, ADMIN);
    {
        assert!(test_scenario::has_most_recent_shared<SwiftGigRegistry>(), 0);
    };
    
    test_scenario::end(scenario);
}

#[test]
fun test_create_talent_profile() {
    let mut scenario = test_scenario::begin(ADMIN);
    
    // Initialize registry
    {
        swiftgig::initialize_registry(test_scenario::ctx(&mut scenario));
    };
    
    // Create talent profile
    test_scenario::next_tx(&mut scenario, TALENT1);
    {
        let mut registry = test_scenario::take_shared<SwiftGigRegistry>(&scenario);
        
        swiftgig::create_talent_profile(
            &mut registry,
            string::utf8(b"John Doe"),
            string::utf8(b"Web Development"),
            swiftgig::is_remote(),
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(registry);
    };
    
    test_scenario::end(scenario);
}

#[test]
fun test_create_client_profile() {
    let mut scenario = test_scenario::begin(ADMIN);
    
    // Initialize registry
    {
        swiftgig::initialize_registry(test_scenario::ctx(&mut scenario));
    };
    
    // Create client profile
    test_scenario::next_tx(&mut scenario, CLIENT1);
    {
        let mut registry = test_scenario::take_shared<SwiftGigRegistry>(&scenario);
        
        swiftgig::create_client_profile(
            &mut registry,
            string::utf8(b"Tech Corp"),
            string::utf8(b"Leading technology company"),
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(registry);
    };
    
    test_scenario::end(scenario);
}

#[test]
fun test_create_gig() {
    let mut scenario = test_scenario::begin(ADMIN);
    let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
    clock::set_for_testing(&mut clock, 1000000);
    
    // Initialize registry
    {
        swiftgig::initialize_registry(test_scenario::ctx(&mut scenario));
    };
    
    // Create client profile first
    test_scenario::next_tx(&mut scenario, CLIENT1);
    {
        let mut registry = test_scenario::take_shared<SwiftGigRegistry>(&scenario);
        
        swiftgig::create_client_profile(
            &mut registry,
            string::utf8(b"Tech Corp"),
            string::utf8(b"Leading technology company"),
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(registry);
    };
    
    // Create gig
    test_scenario::next_tx(&mut scenario, CLIENT1);
    {
        let mut registry = test_scenario::take_shared<SwiftGigRegistry>(&scenario);
        let reward_coin = coin::mint_for_testing<SUI>(REWARD_AMOUNT, test_scenario::ctx(&mut scenario));
        
        swiftgig::create_gig(
            &mut registry,
            string::utf8(b"Web Development Project"),
            string::utf8(b"Build a responsive website"),
            1000000 + DEADLINE_OFFSET,
            2, // talents needed
            ACTIVE_TIMEFRAME,
            reward_coin,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(registry);
    };
    
    // Check gig was created
    test_scenario::next_tx(&mut scenario, CLIENT1);
    {
        assert!(test_scenario::has_most_recent_shared<Gig>(), 0);
    };
    
    clock::destroy_for_testing(clock);
    test_scenario::end(scenario);
}

#[test]
fun test_apply_to_gig() {
    let mut scenario = test_scenario::begin(ADMIN);
    let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
    clock::set_for_testing(&mut clock, 1000000);
    
    setup_gig(&mut scenario, &clock);
    
    // Create talent profile
    test_scenario::next_tx(&mut scenario, TALENT1);
    {
        let mut registry = test_scenario::take_shared<SwiftGigRegistry>(&scenario);
        
        swiftgig::create_talent_profile(
            &mut registry,
            string::utf8(b"John Doe"),
            string::utf8(b"Web Development"),
            swiftgig::is_remote(),
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(registry);
    };
    
    // Apply to gig
    test_scenario::next_tx(&mut scenario, TALENT1);
    {
        let mut gig = test_scenario::take_shared<Gig>(&scenario);
        
        swiftgig::apply_to_gig(
            &mut gig,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(gig);
    };
    
    clock::destroy_for_testing(clock);
    test_scenario::end(scenario);
}

#[test]
fun test_select_talents() {
    let mut scenario = test_scenario::begin(ADMIN);
    let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
    clock::set_for_testing(&mut clock, 1000000);
    
    setup_gig(&mut scenario, &clock);
    
    // Create talent profiles and apply
    create_talent_and_apply(&mut scenario, TALENT1, &b"John Doe", &clock);
    create_talent_and_apply(&mut scenario, TALENT2, &b"Jane Smith", &clock);

    // Select talents
    test_scenario::next_tx(&mut scenario, CLIENT1);
    {
        let mut gig = test_scenario::take_shared<Gig>(&scenario);
        let selected_talents = vector[TALENT1, TALENT2];
        
        swiftgig::select_talents(
            &mut gig,
            selected_talents,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(gig);
    };
    
    clock::destroy_for_testing(clock);
    test_scenario::end(scenario);
}

#[test]
fun test_submit_work() {
    let mut scenario = test_scenario::begin(ADMIN);
    let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
    clock::set_for_testing(&mut clock, 1000000);
    
    setup_gig_with_selected_talents(&mut scenario, &clock);
    
    // Submit work
    test_scenario::next_tx(&mut scenario, TALENT1);
    {
        let mut gig = test_scenario::take_shared<Gig>(&scenario);
        
        swiftgig::submit_work(
            &mut gig,
            string::utf8(b"https://github.com/talent1/project"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(gig);
    };
    
    clock::destroy_for_testing(clock);
    test_scenario::end(scenario);
}

#[test]
fun test_review_submission_satisfied() {
    let mut scenario = test_scenario::begin(ADMIN);
    let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
    clock::set_for_testing(&mut clock, 1000000);
    
    setup_gig_with_submission(&mut scenario, &clock);
    
    // Review submission as satisfied
    test_scenario::next_tx(&mut scenario, CLIENT1);
    {
        let mut gig = test_scenario::take_shared<Gig>(&scenario);
        
        swiftgig::review_submission(
            &mut gig,
            true, // satisfied
            option::none(),
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(gig);
    };
    
    clock::destroy_for_testing(clock);
    test_scenario::end(scenario);
}

#[test]
fun test_distribute_rewards() {
    let mut scenario = test_scenario::begin(ADMIN);
    let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
    clock::set_for_testing(&mut clock, 1000000);
    
    setup_gig_with_satisfied_review(&mut scenario, &clock);
    
    // Distribute rewards
    test_scenario::next_tx(&mut scenario, CLIENT1);
    {
        let mut gig = test_scenario::take_shared<Gig>(&scenario);
        
        swiftgig::distribute_rewards(
            &mut gig,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(gig);
    };
    
    // Check talents received payment
    test_scenario::next_tx(&mut scenario, TALENT1);
    {
        assert!(test_scenario::has_most_recent_for_sender<Coin<SUI>>(&scenario), 0);
    };
    
    clock::destroy_for_testing(clock);
    test_scenario::end(scenario);
}

#[test]
fun test_contest_decision() {
    let mut scenario = test_scenario::begin(ADMIN);
    let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
    clock::set_for_testing(&mut clock, 1000000);
    
    setup_gig_with_unsatisfied_review(&mut scenario, &clock);
    
    // Contest decision
    test_scenario::next_tx(&mut scenario, TALENT1);
    {
        let mut gig = test_scenario::take_shared<Gig>(&scenario);
        
        swiftgig::contest_decision(
            &mut gig,
            string::utf8(b"Work meets all requirements"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(gig);
    };
    
    // Check poll was created
    test_scenario::next_tx(&mut scenario, TALENT1);
    {
        assert!(test_scenario::has_most_recent_shared<Poll>(), 0);
    };
    
    clock::destroy_for_testing(clock);
    test_scenario::end(scenario);
}

#[test]
fun test_vote_in_dispute() {
    let mut scenario = test_scenario::begin(ADMIN);
    let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
    clock::set_for_testing(&mut clock, 1000000);
    
    setup_dispute(&mut scenario, &clock);
    
    // Create high credibility voter
    test_scenario::next_tx(&mut scenario, VOTER1);
    {
        let mut registry = test_scenario::take_shared<SwiftGigRegistry>(&scenario);
        
        swiftgig::create_talent_profile(
            &mut registry,
            string::utf8(b"Expert Voter"),
            string::utf8(b"Blockchain Development"),
            swiftgig::is_remote(),
            test_scenario::ctx(&mut scenario)
        );
        
        // Update credibility to voting threshold
        swiftgig::update_credibility_score(
            &mut registry,
            VOTER1,
            true, // increase
            25    // amount to reach 75 (50 + 25)
        );
        
        test_scenario::return_shared(registry);
    };
    
    // Vote in dispute
    test_scenario::next_tx(&mut scenario, VOTER1);
    {
        let registry = test_scenario::take_shared<SwiftGigRegistry>(&scenario);
        let mut poll = test_scenario::take_shared<Poll>(&scenario);
        
        swiftgig::vote_in_dispute(
            &registry,
            &mut poll,
            true, // vote for talent
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(registry);
        test_scenario::return_shared(poll);
    };
    
    clock::destroy_for_testing(clock);
    test_scenario::end(scenario);
}

#[test]
fun test_resolve_dispute_talent_wins() {
    let mut scenario = test_scenario::begin(ADMIN);
    let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
    clock::set_for_testing(&mut clock, 1000000);
    
    setup_dispute_with_votes(&mut scenario, &clock, true); // talent wins
    
    // Fast forward time past poll end
    clock::increment_for_testing(&mut clock, 604800001); // 7 days + 1ms
    
    // Resolve dispute
    test_scenario::next_tx(&mut scenario, ADMIN);
    {
        let mut poll = test_scenario::take_shared<Poll>(&scenario);
        let mut gig = test_scenario::take_shared<Gig>(&scenario);
        
        swiftgig::resolve_dispute(
            &mut poll,
            &mut gig,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(poll);
        test_scenario::return_shared(gig);
    };
    
    // Check talent received payment
    test_scenario::next_tx(&mut scenario, TALENT1);
    {
        assert!(test_scenario::has_most_recent_for_sender<Coin<SUI>>(&scenario), 0);
    };
    
    clock::destroy_for_testing(clock);
    test_scenario::end(scenario);
}

#[test]
fun test_resolve_dispute_client_wins() {
    let mut scenario = test_scenario::begin(ADMIN);
    let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
    clock::set_for_testing(&mut clock, 1000000);
    
    setup_dispute_with_votes(&mut scenario, &clock, false); // client wins
    
    // Fast forward time past poll end
    clock::increment_for_testing(&mut clock, 604800001); // 7 days + 1ms
    
    // Resolve dispute
    test_scenario::next_tx(&mut scenario, ADMIN);
    {
        let mut poll = test_scenario::take_shared<Poll>(&scenario);
        let mut gig = test_scenario::take_shared<Gig>(&scenario);
        
        swiftgig::resolve_dispute(
            &mut poll,
            &mut gig,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(poll);
        test_scenario::return_shared(gig);
    };
    
    // Check client received refund
    test_scenario::next_tx(&mut scenario, CLIENT1);
    {
        assert!(test_scenario::has_most_recent_for_sender<Coin<SUI>>(&scenario), 0);
    };
    
    clock::destroy_for_testing(clock);
    test_scenario::end(scenario);
}

#[test]
fun test_update_credibility_score() {
    let mut scenario = test_scenario::begin(ADMIN);
    
    // Initialize registry
    {
        swiftgig::initialize_registry(test_scenario::ctx(&mut scenario));
    };
    
    // Create talent profile
    test_scenario::next_tx(&mut scenario, TALENT1);
    {
        let mut registry = test_scenario::take_shared<SwiftGigRegistry>(&scenario);
        
        swiftgig::create_talent_profile(
            &mut registry,
            string::utf8(b"John Doe"),
            string::utf8(b"Web Development"),
            swiftgig::is_remote(),
            test_scenario::ctx(&mut scenario)
        );
        
        // Update credibility score
        swiftgig::update_credibility_score(
            &mut registry,
            TALENT1,
            true, // increase
            20    // amount
        );
        
        test_scenario::return_shared(registry);
    };
    
    test_scenario::end(scenario);
}


#[test, expected_failure(abort_code = ::swiftgig::swiftgig::E_ALREADY_APPLIED)]
fun test_apply_twice_fails() {
    let mut scenario = test_scenario::begin(ADMIN);
    let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
    clock::set_for_testing(&mut clock, 1000000);
    
    setup_gig(&mut scenario, &clock);
    
    // Create talent and apply once
    create_talent_and_apply(&mut scenario, TALENT1, &b"John Doe", &clock);
    
    // Try to apply again (should fail)
    test_scenario::next_tx(&mut scenario, TALENT1);
    {
        let mut gig = test_scenario::take_shared<Gig>(&scenario);
        
        swiftgig::apply_to_gig(
            &mut gig,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(gig);
    };
    
    clock::destroy_for_testing(clock);
    test_scenario::end(scenario);
}

#[test, expected_failure(abort_code = ::swiftgig::swiftgig::E_NOT_CLIENT)]
fun test_non_client_select_talents_fails() {
    let mut scenario = test_scenario::begin(ADMIN);
    let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
    clock::set_for_testing(&mut clock, 1000000);
    
    setup_gig(&mut scenario, &clock);
    create_talent_and_apply(&mut scenario, TALENT1, &b"John Doe", &clock);
    
    // Try to select talents as non-client (should fail)
    test_scenario::next_tx(&mut scenario, TALENT1); // Wrong sender
    {
        let mut gig = test_scenario::take_shared<Gig>(&scenario);
        let selected_talents = vector[TALENT1];
        
        swiftgig::select_talents(
            &mut gig,
            selected_talents,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(gig);
    };
    
    clock::destroy_for_testing(clock);
    test_scenario::end(scenario);
}

#[test, expected_failure(abort_code = ::swiftgig::swiftgig::E_LOW_CREDIBILITY)]
fun test_low_credibility_vote_fails() {
    let mut scenario = test_scenario::begin(ADMIN);
    let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
    clock::set_for_testing(&mut clock, 1000000);
    
    setup_dispute(&mut scenario, &clock);
    
    // Create low credibility voter (default 50, need 70+)
    test_scenario::next_tx(&mut scenario, VOTER1);
    {
        let mut registry = test_scenario::take_shared<SwiftGigRegistry>(&scenario);
        
        swiftgig::create_talent_profile(
            &mut registry,
            string::utf8(b"Low Cred Voter"),
            string::utf8(b"Development"),
            swiftgig::is_remote(),
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(registry);
    };
    
    // Try to vote with low credibility (should fail)
    test_scenario::next_tx(&mut scenario, VOTER1);
    {
        let registry = test_scenario::take_shared<SwiftGigRegistry>(&scenario);
        let mut poll = test_scenario::take_shared<Poll>(&scenario);
        
        swiftgig::vote_in_dispute(
            &registry,
            &mut poll,
            true,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(registry);
        test_scenario::return_shared(poll);
    };
    
    clock::destroy_for_testing(clock);
    test_scenario::end(scenario);
}

// Helper functions

fun setup_gig(scenario: &mut Scenario, clock: &Clock) {
    // Initialize registry
    test_scenario::next_tx(scenario, ADMIN);
    {
        swiftgig::initialize_registry(test_scenario::ctx(scenario));
    };
    
    // Create client profile and gig
    test_scenario::next_tx(scenario, CLIENT1);
    {
        let mut registry = test_scenario::take_shared<SwiftGigRegistry>(scenario);
        
        swiftgig::create_client_profile(
            &mut registry,
            string::utf8(b"Tech Corp"),
            string::utf8(b"Leading technology company"),
            test_scenario::ctx(scenario)
        );
        
        let reward_coin = coin::mint_for_testing<SUI>(REWARD_AMOUNT, test_scenario::ctx(scenario));
        
        swiftgig::create_gig(
            &mut registry,
            string::utf8(b"Web Development Project"),
            string::utf8(b"Build a responsive website"),
            1000000 + DEADLINE_OFFSET,
            2,
            ACTIVE_TIMEFRAME,
            reward_coin,
            clock,
            test_scenario::ctx(scenario)
        );
        
        test_scenario::return_shared(registry);
    };
}

fun create_talent_and_apply(scenario: &mut Scenario, talent_addr: address, name: &vector<u8>, clock: &Clock) {
    test_scenario::next_tx(scenario, talent_addr);
    {
        let mut registry = test_scenario::take_shared<SwiftGigRegistry>(scenario);
        
        swiftgig::create_talent_profile(
            &mut registry,
            string::utf8(*name),
            string::utf8(b"Web Development"),
            swiftgig::is_remote(),
            test_scenario::ctx(scenario)
        );
        
        test_scenario::return_shared(registry);
    };
    
    test_scenario::next_tx(scenario, talent_addr);
    {
        let mut gig = test_scenario::take_shared<Gig>(scenario);
        
        swiftgig::apply_to_gig(
            &mut gig,
            clock,
            test_scenario::ctx(scenario)
        );
        
        test_scenario::return_shared(gig);
    };
}

fun setup_gig_with_selected_talents(scenario: &mut Scenario, clock: &Clock) {
    setup_gig(scenario, clock);
    create_talent_and_apply(scenario, TALENT1, &b"John Doe", clock);
    create_talent_and_apply(scenario, TALENT2, &b"Jane Smith", clock);
    
    // Select talents
    test_scenario::next_tx(scenario, CLIENT1);
    {
        let mut gig = test_scenario::take_shared<Gig>(scenario);
        let selected_talents = vector[TALENT1, TALENT2];
        
        swiftgig::select_talents(
            &mut gig,
            selected_talents,
            test_scenario::ctx(scenario)
        );
        
        test_scenario::return_shared(gig);
    };
}

fun setup_gig_with_submission(scenario: &mut Scenario, clock: &Clock) {
    setup_gig_with_selected_talents(scenario, clock);
    
    // Submit work
    test_scenario::next_tx(scenario, TALENT1);
    {
        let mut gig = test_scenario::take_shared<Gig>(scenario);
        
        swiftgig::submit_work(
            &mut gig,
            string::utf8(b"https://github.com/talent1/project"),
            clock,
            test_scenario::ctx(scenario)
        );
        
        test_scenario::return_shared(gig);
    };
}

fun setup_gig_with_satisfied_review(scenario: &mut Scenario, clock: &Clock) {
    setup_gig_with_submission(scenario, clock);
    
    // Review as satisfied
    test_scenario::next_tx(scenario, CLIENT1);
    {
        let mut gig = test_scenario::take_shared<Gig>(scenario);
        
        swiftgig::review_submission(
            &mut gig,
            true,
            option::none(),
            test_scenario::ctx(scenario)
        );
        
        test_scenario::return_shared(gig);
    };
}

fun setup_gig_with_unsatisfied_review(scenario: &mut Scenario, clock: &Clock) {
    setup_gig_with_submission(scenario, clock);
    
    // Review as unsatisfied
    test_scenario::next_tx(scenario, CLIENT1);
    {
        let mut gig = test_scenario::take_shared<Gig>(scenario);
        
        swiftgig::review_submission(
            &mut gig,
            false,
            option::some(string::utf8(b"Work doesn't meet requirements")),
            test_scenario::ctx(scenario)
        );
        
        test_scenario::return_shared(gig);
    };
}

fun setup_dispute(scenario: &mut Scenario, clock: &Clock) {
    setup_gig_with_unsatisfied_review(scenario, clock);
    
    // Contest decision
    test_scenario::next_tx(scenario, TALENT1);
    {
        let mut gig = test_scenario::take_shared<Gig>(scenario);
        
        swiftgig::contest_decision(
            &mut gig,
            string::utf8(b"Work meets all requirements"),
            clock,
            test_scenario::ctx(scenario)
        );
        
        test_scenario::return_shared(gig);
    };
}

fun setup_dispute_with_votes(scenario: &mut Scenario, clock: &Clock, talent_wins: bool) {
    setup_dispute(scenario, clock);
    
    // Create high credibility voters
    test_scenario::next_tx(scenario, VOTER1);
    {
        let mut registry = test_scenario::take_shared<SwiftGigRegistry>(scenario);
        
        swiftgig::create_talent_profile(
            &mut registry,
            string::utf8(b"Expert Voter 1"),
            string::utf8(b"Blockchain Development"),
            swiftgig::is_remote(),
            test_scenario::ctx(scenario)
        );
        
        swiftgig::update_credibility_score(&mut registry, VOTER1, true, 25);
        
        test_scenario::return_shared(registry);
    };
    
    test_scenario::next_tx(scenario, VOTER2);
    {
        let mut registry = test_scenario::take_shared<SwiftGigRegistry>(scenario);
        
        swiftgig::create_talent_profile(
            &mut registry,
            string::utf8(b"Expert Voter 2"),
            string::utf8(b"Smart Contract Development"),
            swiftgig::is_remote(),
            test_scenario::ctx(scenario)
        );
        
        swiftgig::update_credibility_score(&mut registry, VOTER2, true, 25);
        
        test_scenario::return_shared(registry);
    };
    
    // Cast votes
    test_scenario::next_tx(scenario, VOTER1);
    {
        let registry = test_scenario::take_shared<SwiftGigRegistry>(scenario);
        let mut poll = test_scenario::take_shared<Poll>(scenario);
        
        swiftgig::vote_in_dispute(
            &registry,
            &mut poll,
            talent_wins, // vote based on parameter
            clock,
            test_scenario::ctx(scenario)
        );
        
        test_scenario::return_shared(registry);
        test_scenario::return_shared(poll);
    };
    
    test_scenario::next_tx(scenario, VOTER2);
    {
        let registry = test_scenario::take_shared<SwiftGigRegistry>(scenario);
        let mut poll = test_scenario::take_shared<Poll>(scenario);
        
        swiftgig::vote_in_dispute(
            &registry,
            &mut poll,
            talent_wins, // same vote to ensure one side wins
            clock,
            test_scenario::ctx(scenario)
        );
        
        test_scenario::return_shared(registry);
        test_scenario::return_shared(poll);
    };
}

#[test]
fun test_full_workflow() {
    let mut scenario = test_scenario::begin(ADMIN);
    let mut clock = clock::create_for_testing(test_scenario::ctx(&mut scenario));
    clock::set_for_testing(&mut clock, 1000000);
    
    // Step 1: Initialize registry
    test_scenario::next_tx(&mut scenario, ADMIN);
    {
        swiftgig::initialize_registry(test_scenario::ctx(&mut scenario));
    };
    
    // Step 2: Create client profile
    test_scenario::next_tx(&mut scenario, CLIENT1);
    {
        let mut registry = test_scenario::take_shared<SwiftGigRegistry>(&scenario);
        
        swiftgig::create_client_profile(
            &mut registry,
            string::utf8(b"Tech Solutions Inc"),
            string::utf8(b"We build cutting-edge software solutions"),
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(registry);
    };
    
    // Step 3: Create talent profiles
    test_scenario::next_tx(&mut scenario, TALENT1);
    {
        let mut registry = test_scenario::take_shared<SwiftGigRegistry>(&scenario);
        
        swiftgig::create_talent_profile(
            &mut registry,
            string::utf8(b"Alice Developer"),
            string::utf8(b"Full Stack Development"),
            swiftgig::is_remote(),
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(registry);
    };
    
    test_scenario::next_tx(&mut scenario, TALENT2);
    {
        let mut registry = test_scenario::take_shared<SwiftGigRegistry>(&scenario);
        
        swiftgig::create_talent_profile(
            &mut registry,
            string::utf8(b"Bob Designer"),
            string::utf8(b"UI/UX Design"),
            swiftgig::is_both(),
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(registry);
    };
    
    // Step 4: Create gig
    test_scenario::next_tx(&mut scenario, CLIENT1);
    {
        let mut registry = test_scenario::take_shared<SwiftGigRegistry>(&scenario);
        let reward_coin = coin::mint_for_testing<SUI>(REWARD_AMOUNT, test_scenario::ctx(&mut scenario));
        
        swiftgig::create_gig(
            &mut registry,
            string::utf8(b"E-commerce Platform Development"),
            string::utf8(b"Build a modern e-commerce platform with React and Node.js"),
            1000000 + DEADLINE_OFFSET,
            2, // Need 2 talents
            ACTIVE_TIMEFRAME,
            reward_coin,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(registry);
    };
    
    // Step 5: Talents apply to gig
    test_scenario::next_tx(&mut scenario, TALENT1);
    {
        let mut gig = test_scenario::take_shared<Gig>(&scenario);
        
        swiftgig::apply_to_gig(
            &mut gig,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(gig);
    };
    
    test_scenario::next_tx(&mut scenario, TALENT2);
    {
        let mut gig = test_scenario::take_shared<Gig>(&scenario);
        
        swiftgig::apply_to_gig(
            &mut gig,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(gig);
    };
    
    // Step 6: Client selects talents
    test_scenario::next_tx(&mut scenario, CLIENT1);
    {
        let mut gig = test_scenario::take_shared<Gig>(&scenario);
        let selected_talents = vector[TALENT1, TALENT2];
        
        swiftgig::select_talents(
            &mut gig,
            selected_talents,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(gig);
    };
    
    // Step 7: Talents submit work
    test_scenario::next_tx(&mut scenario, TALENT1);
    {
        let mut gig = test_scenario::take_shared<Gig>(&scenario);
        
        swiftgig::submit_work(
            &mut gig,
            string::utf8(b"https://github.com/alice/ecommerce-backend"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(gig);
    };
    
    test_scenario::next_tx(&mut scenario, TALENT2);
    {
        let mut gig = test_scenario::take_shared<Gig>(&scenario);
        
        swiftgig::submit_work(
            &mut gig,
            string::utf8(b"https://github.com/bob/ecommerce-frontend"),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(gig);
    };
    
    // Step 8: Client reviews and is initially unsatisfied
    test_scenario::next_tx(&mut scenario, CLIENT1);
    {
        let mut gig = test_scenario::take_shared<Gig>(&scenario);
        
        swiftgig::review_submission(
            &mut gig,
            false, // Not satisfied
            option::some(string::utf8(b"Missing payment integration and mobile responsiveness")),
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(gig);
    };
    
    // Step 9: Talent contests the decision
    test_scenario::next_tx(&mut scenario, TALENT1);
    {
        let mut gig = test_scenario::take_shared<Gig>(&scenario);
        
        swiftgig::contest_decision(
            &mut gig,
            string::utf8(b"All requirements were met according to specifications. Payment integration was not in original scope."),
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(gig);
    };
    
    // Step 10: Create high-credibility voters
    test_scenario::next_tx(&mut scenario, VOTER1);
    {
        let mut registry = test_scenario::take_shared<SwiftGigRegistry>(&scenario);
        
        swiftgig::create_talent_profile(
            &mut registry,
            string::utf8(b"Expert Judge Carol"),
            string::utf8(b"Senior Software Architect"),
            swiftgig::is_remote(),
            test_scenario::ctx(&mut scenario)
        );
        
        // Increase credibility to voting threshold
        swiftgig::update_credibility_score(
            &mut registry,
            VOTER1,
            true, // increase
            25    // 50 + 25 = 75 (above 70 threshold)
        );
        
        test_scenario::return_shared(registry);
    };
    
    test_scenario::next_tx(&mut scenario, VOTER2);
    {
        let mut registry = test_scenario::take_shared<SwiftGigRegistry>(&scenario);
        
        swiftgig::create_client_profile(
            &mut registry,
            string::utf8(b"Expert Judge Dave"),
            string::utf8(b"CTO with 15 years experience"),
            test_scenario::ctx(&mut scenario)
        );
        
        // Increase credibility to voting threshold
        swiftgig::update_credibility_score(
            &mut registry,
            VOTER2,
            true, // increase
            30    // 50 + 30 = 80 (above 70 threshold)
        );
        
        test_scenario::return_shared(registry);
    };
    
    // Step 11: Voters cast their votes (majority for talent)
    test_scenario::next_tx(&mut scenario, VOTER1);
    {
        let registry = test_scenario::take_shared<SwiftGigRegistry>(&scenario);
        let mut poll = test_scenario::take_shared<Poll>(&scenario);
        
        swiftgig::vote_in_dispute(
            &registry,
            &mut poll,
            true, // Vote for talent
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(registry);
        test_scenario::return_shared(poll);
    };
    
    test_scenario::next_tx(&mut scenario, VOTER2);
    {
        let registry = test_scenario::take_shared<SwiftGigRegistry>(&scenario);
        let mut poll = test_scenario::take_shared<Poll>(&scenario);
        
        swiftgig::vote_in_dispute(
            &registry,
            &mut poll,
            true, // Vote for talent
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(registry);
        test_scenario::return_shared(poll);
    };
    
    // Step 12: Fast forward past poll end time
    clock::increment_for_testing(&mut clock, 604800001); // 7 days + 1ms
    
    // Step 13: Resolve dispute (talent wins)
    test_scenario::next_tx(&mut scenario, ADMIN);
    {
        let mut poll = test_scenario::take_shared<Poll>(&scenario);
        let mut gig = test_scenario::take_shared<Gig>(&scenario);
        
        swiftgig::resolve_dispute(
            &mut poll,
            &mut gig,
            &clock,
            test_scenario::ctx(&mut scenario)
        );
        
        test_scenario::return_shared(poll);
        test_scenario::return_shared(gig);
    };
    
    // Step 14: Verify talents received their payments
    test_scenario::next_tx(&mut scenario, TALENT1);
    {
        assert!(test_scenario::has_most_recent_for_sender<Coin<SUI>>(&scenario), 0);
        let payment = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
        let expected_amount = REWARD_AMOUNT / 2; // Split between 2 talents
        assert!(coin::value(&payment) == expected_amount, 1);
        test_utils::destroy(payment);
    };
    
    test_scenario::next_tx(&mut scenario, TALENT2);
    {
        assert!(test_scenario::has_most_recent_for_sender<Coin<SUI>>(&scenario), 0);
        let payment = test_scenario::take_from_sender<Coin<SUI>>(&scenario);
        let expected_amount = REWARD_AMOUNT / 2; // Split between 2 talents
        assert!(coin::value(&payment) == expected_amount, 1);
        test_utils::destroy(payment);
    };
    
    // Step 15: Update credibility scores based on dispute outcome
    test_scenario::next_tx(&mut scenario, ADMIN);
    {
        let mut registry = test_scenario::take_shared<SwiftGigRegistry>(&scenario);
        
        // Increase talent credibility (they won)
        swiftgig::update_credibility_score(&mut registry, TALENT1, true, 5);
        swiftgig::update_credibility_score(&mut registry, TALENT2, true, 5);
        
        // Decrease client credibility (they lost dispute)
        swiftgig::update_credibility_score(&mut registry, CLIENT1, false, 3);
        
        test_scenario::return_shared(registry);
    };
    
    clock::destroy_for_testing(clock);
    test_scenario::end(scenario);
}