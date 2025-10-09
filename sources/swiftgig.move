module swiftgig::swiftgig;

use sui::sui::SUI;
use sui::coin::{Self, Coin};
use sui::balance::{Self, Balance};
use sui::clock::{Self, Clock};
use sui::event;
use std::string::{Self, String};

// State constants for gigs
const GIG_ACTIVE: u8 = 0;
const GIG_SUBMITTED: u8 = 1;
const GIG_REVIEW_SATISFIED: u8 = 2;
const GIG_REVIEW_UNSATISFIED: u8 = 3;
const GIG_DISPUTED: u8 = 4;
const GIG_CLOSED: u8 = 5;

// Error codes
const E_NOT_CLIENT: u64 = 0;
const E_GIG_NOT_ACTIVE: u64 = 2;
const E_TALENT_NOT_ACCEPTED: u64 = 3;
const E_ALREADY_APPLIED: u64 = 4;
const E_DEADLINE_PASSED: u64 = 5;
const E_INVALID_STATE: u64 = 6;
const E_ALREADY_VOTED: u64 = 7;
const E_LOW_CREDIBILITY: u64 = 8;
const E_POLL_NOT_ENDED: u64 = 9;
const E_TALENT_NOT_IN_WAITLIST: u64 = 10;

// Minimum credibility score required to vote in disputes
const MIN_CREDIBILITY_TO_VOTE: u8 = 70;

public enum Preferred has store, copy, drop {
    Remote,
    Physical,
    Both
}

public fun is_remote(): Preferred {
    Preferred::Remote
}

public fun is_remote_sure(s: &Preferred): bool {
    match (s) {
        Preferred::Remote => true,
        _ => false, //anything else returns false
    }
}

public fun is_physical_sure(s: &Preferred): bool {
    match (s) {
        Preferred::Physical => true,
        _ => false, //anything else returns false
    }
}
public fun is_both_sure(s: &Preferred): bool {
    match (s) {
        Preferred::Both => true,
        _ => false, //anything else returns false
    }
}
public fun is_physical(): Preferred {
    Preferred::Physical
}

public fun is_both(): Preferred {
    Preferred::Both
}

public struct TalentProfile has key, store {
    id: UID,
    talent_addr: address,
    full_name: String,
    preferred_mode: Preferred,
    skill: String,
    credibility_score: u8,
}

public struct ClientProfile has key, store {
    id: UID,
    full_name: String,
    client_addr: address,
    extra_info: String,
    credibility_score: u8,
}

public struct GigMetadata has store {
    name: String,
    description: String,
    deadline: u64,
    talents_needed: u64,
    gig_active_timeframe: u64,
}

public struct Submission has store {
    talent: address,
    submission_link: String,
    timestamp: u64,
}

public struct Poll has key, store {
    id: UID,
    gig_id: address,
    talent: address,
    client: address,
    client_reason: String,
    talent_reason: String,
    votes_for_talent: u64,
    votes_for_client: u64,
    voters: vector<address>,
    start_time: u64,
    end_time: u64,
    resolved: bool,
    winner: Option<address>,
}

public struct Gig has key, store {
    id: UID,
    creator: address,
    metadata: GigMetadata,
    treasury_balance: Balance<SUI>,
    waitlist: vector<address>,
    accepted_talents: vector<address>,
    submissions: vector<Submission>,
    state: u8,
    client_satisfaction: Option<bool>,
    unsatisfaction_reason: Option<String>,
    contested: bool,
    poll_id: Option<address>,
}

// Registry to store all profiles
public struct SwiftGigRegistry has key {
    id: UID,
    talent_profiles: vector<TalentProfile>,
    client_profiles: vector<ClientProfile>,
    active_gigs: vector<address>,
    completed_gigs: vector<address>,
}

// Events
public struct TalentProfileCreated has copy, drop {
    talent_id: address,
    talent_addr: address,
    skill: String,
}

public struct ClientProfileCreated has copy, drop {
    client_id: address,
    client_addr: address,
    full_name: String,
}

public struct GigCreated has copy, drop {
    gig_id: address,
    creator: address,
    reward_amount: u64,
    deadline: u64,
}

public struct TalentApplied has copy, drop {
    gig_id: address,
    talent: address,
}

public struct TalentSelected has copy, drop {
    gig_id: address,
    talent: address,
}

public struct WorkSubmitted has copy, drop {
    gig_id: address,
    talent: address,
    submission_link: String,
}

public struct DisputeCreated has copy, drop {
    gig_id: address,
    poll_id: address,
    talent: address,
    client: address,
}

public struct VoteCasted has copy, drop {
    poll_id: address,
    voter: address,
    vote_for_talent: bool,
}

// Initialize the SwiftGig registry
public fun initialize_registry(ctx: &mut TxContext) {
    let registry = SwiftGigRegistry {
        id: object::new(ctx),
        talent_profiles: vector::empty<TalentProfile>(),
        client_profiles: vector::empty<ClientProfile>(),
        active_gigs: vector::empty<address>(),
        completed_gigs: vector::empty<address>(),
    };
    transfer::share_object(registry);
}

// Create talent profile
public fun create_talent_profile(
    registry: &mut SwiftGigRegistry,
    full_name: String,
    skill: String,
    preferred_mode: Preferred,
    ctx: &mut TxContext
) {
    let talent_addr = tx_context::sender(ctx);
    let profile_id = object::new(ctx);
    let profile_address = object::uid_to_address(&profile_id);
    
    let profile = TalentProfile {
        id: profile_id,
        talent_addr,
        full_name,
        preferred_mode,
        skill,
        credibility_score: 50, // Starting score
    };
    
    vector::push_back(&mut registry.talent_profiles, profile);
    
    event::emit(TalentProfileCreated {
        talent_id: profile_address,
        talent_addr,
        skill,
    });
}

// Create client profile
public fun create_client_profile(
    registry: &mut SwiftGigRegistry,
    full_name: String,
    extra_info: String,
    ctx: &mut TxContext
) {
    let client_addr = tx_context::sender(ctx);
    let profile_id = object::new(ctx);
    let profile_address = object::uid_to_address(&profile_id);
    
    let profile = ClientProfile {
        id: profile_id,
        full_name,
        client_addr,
        extra_info,
        credibility_score: 50, // Starting score
    };
    
    vector::push_back(&mut registry.client_profiles, profile);
    
    event::emit(ClientProfileCreated {
        client_id: profile_address,
        client_addr,
        full_name,
    });
}

// Create a new gig with treasury
public fun create_gig(
    registry: &mut SwiftGigRegistry,
    name: String,
    description: String,
    deadline: u64,
    talents_needed: u64,
    gig_active_timeframe: u64,
    reward_payment: Coin<SUI>,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let creator = tx_context::sender(ctx);
    let gig_id = object::new(ctx);
    let gig_address = object::uid_to_address(&gig_id);
    let current_time = clock::timestamp_ms(clock);
    
    // Ensure deadline is in the future
    assert!(deadline > current_time, E_DEADLINE_PASSED);
    
    let reward_amount = coin::value(&reward_payment);
    let treasury_balance = coin::into_balance(reward_payment);
    
    let metadata = GigMetadata {
        name,
        description,
        deadline,
        talents_needed,
        gig_active_timeframe: current_time + gig_active_timeframe,
    };
    
    let gig = Gig {
        id: gig_id,
        creator,
        metadata,
        treasury_balance,
        waitlist: vector::empty<address>(),
        accepted_talents: vector::empty<address>(),
        submissions: vector::empty<Submission>(),
        state: GIG_ACTIVE,
        client_satisfaction: option::none(),
        unsatisfaction_reason: option::none(),
        contested: false,
        poll_id: option::none(),
    };
    
    vector::push_back(&mut registry.active_gigs, gig_address);
    
    event::emit(GigCreated {
        gig_id: gig_address,
        creator,
        reward_amount,
        deadline,
    });
    
    transfer::share_object(gig);
}

// Talent applies to gig
public fun apply_to_gig(
    gig: &mut Gig,
    clock: &Clock,
    ctx: &TxContext
) {
    let talent_addr = tx_context::sender(ctx);
    let current_time = clock::timestamp_ms(clock);
    
    assert!(gig.state == GIG_ACTIVE, E_GIG_NOT_ACTIVE);
    assert!(current_time < gig.metadata.gig_active_timeframe, E_DEADLINE_PASSED);
    assert!(!vector::contains(&gig.waitlist, &talent_addr), E_ALREADY_APPLIED);
    
    vector::push_back(&mut gig.waitlist, talent_addr);
    
    event::emit(TalentApplied {
        gig_id: object::uid_to_address(&gig.id),
        talent: talent_addr,
    });
}

// Client selects talents from waitlist
public fun select_talents(
    gig: &mut Gig,
    selected_talents: vector<address>,
    ctx: &TxContext
) {
    let sender = tx_context::sender(ctx);
    assert!(sender == gig.creator, E_NOT_CLIENT);
    assert!(gig.state == GIG_ACTIVE, E_INVALID_STATE);
    
    let mut i = 0;
    while (i < vector::length(&selected_talents)) {
        let talent = *vector::borrow(&selected_talents, i);
        assert!(vector::contains(&gig.waitlist, &talent), E_TALENT_NOT_IN_WAITLIST);
        
        if (!vector::contains(&gig.accepted_talents, &talent)) {
            vector::push_back(&mut gig.accepted_talents, talent);
            
            event::emit(TalentSelected {
                gig_id: object::uid_to_address(&gig.id),
                talent,
            });
        };
        i = i + 1;
    };
}

// Submit work
public fun submit_work(
    gig: &mut Gig,
    submission_link: String,
    clock: &Clock,
    ctx: &TxContext
) {
    let talent_addr = tx_context::sender(ctx);
    let current_time = clock::timestamp_ms(clock);
    
    assert!(vector::contains(&gig.accepted_talents, &talent_addr), E_TALENT_NOT_ACCEPTED);
    assert!(current_time < gig.metadata.deadline, E_DEADLINE_PASSED);
    
    let submission = Submission {
        talent: talent_addr,
        submission_link,
        timestamp: current_time,
    };
    
    vector::push_back(&mut gig.submissions, submission);
    gig.state = GIG_SUBMITTED;
    
    event::emit(WorkSubmitted {
        gig_id: object::uid_to_address(&gig.id),
        talent: talent_addr,
        submission_link,
    });
}

// Client reviews submission
public fun review_submission(
    gig: &mut Gig,
    satisfied: bool,
    reason: Option<String>,
    ctx: &TxContext
) {
    let sender = tx_context::sender(ctx);
    assert!(sender == gig.creator, E_NOT_CLIENT);
    assert!(gig.state == GIG_SUBMITTED, E_INVALID_STATE);
    
    gig.client_satisfaction = option::some(satisfied);
    
    if (satisfied) {
        gig.state = GIG_REVIEW_SATISFIED;
    } else {
        gig.state = GIG_REVIEW_UNSATISFIED;
        gig.unsatisfaction_reason = reason;
    };
}

// Distribute rewards when client is satisfied
public fun distribute_rewards(
    gig: &mut Gig,
    ctx: &mut TxContext
) {
    assert!(gig.state == GIG_REVIEW_SATISFIED, E_INVALID_STATE);
    
    let total_balance = balance::value(&gig.treasury_balance);
    let accepted_count = vector::length(&gig.accepted_talents);
    
    if (accepted_count > 0 && total_balance > 0) {
        let reward_per_talent = total_balance / accepted_count;
        
        let mut i = 0;
        while (i < accepted_count) {
            let talent = *vector::borrow(&gig.accepted_talents, i);
            let payment_balance = balance::split(&mut gig.treasury_balance, reward_per_talent);
            let payment_coin = coin::from_balance(payment_balance, ctx);
            transfer::public_transfer(payment_coin, talent);
            i = i + 1;
        };
    };
    
    gig.state = GIG_CLOSED;
}

// Refund client when not contested
public fun refund_client(
    gig: &mut Gig,
    ctx: &mut TxContext
) {
    assert!(gig.state == GIG_REVIEW_UNSATISFIED, E_INVALID_STATE);
    assert!(!gig.contested, E_INVALID_STATE);
    
    let refund_balance = balance::withdraw_all(&mut gig.treasury_balance);
    let refund_coin = coin::from_balance(refund_balance, ctx);
    transfer::public_transfer(refund_coin, gig.creator);
    
    gig.state = GIG_CLOSED;
}

// Contest client decision
public fun contest_decision(
    gig: &mut Gig,
    talent_reason: String,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let talent_addr = tx_context::sender(ctx);
    let current_time = clock::timestamp_ms(clock);
    
    assert!(vector::contains(&gig.accepted_talents, &talent_addr), E_TALENT_NOT_ACCEPTED);
    assert!(gig.state == GIG_REVIEW_UNSATISFIED, E_INVALID_STATE);
    assert!(!gig.contested, E_INVALID_STATE);
    
    let poll_id = object::new(ctx);
    let poll_address = object::uid_to_address(&poll_id);
    
    let client_reason = if (option::is_some(&gig.unsatisfaction_reason)) {
        *option::borrow(&gig.unsatisfaction_reason)
    } else {
        string::utf8(b"No reason provided")
    };
    
    let poll = Poll {
        id: poll_id,
        gig_id: object::uid_to_address(&gig.id),
        talent: talent_addr,
        client: gig.creator,
        client_reason,
        talent_reason,
        votes_for_talent: 0,
        votes_for_client: 0,
        voters: vector::empty<address>(),
        start_time: current_time,
        end_time: current_time + 604800000, // 7 days in milliseconds
        resolved: false,
        winner: option::none(),
    };
    
    gig.contested = true;
    gig.state = GIG_DISPUTED;
    gig.poll_id = option::some(poll_address);
    
    event::emit(DisputeCreated {
        gig_id: object::uid_to_address(&gig.id),
        poll_id: poll_address,
        talent: talent_addr,
        client: gig.creator,
    });
    
    transfer::share_object(poll);
}

// Vote in dispute (only high credibility users)
public fun vote_in_dispute(
    registry: &SwiftGigRegistry,
    poll: &mut Poll,
    vote_for_talent: bool,
    clock: &Clock,
    ctx: &TxContext
) {
    let voter = tx_context::sender(ctx);
    let current_time = clock::timestamp_ms(clock);
    
    assert!(current_time < poll.end_time, E_POLL_NOT_ENDED);
    assert!(!vector::contains(&poll.voters, &voter), E_ALREADY_VOTED);
    
    // Check if voter has high credibility
    let mut has_high_credibility = false;
    let mut i = 0;
    
    // Check talent profiles
    while (i < vector::length(&registry.talent_profiles)) {
        let profile = vector::borrow(&registry.talent_profiles, i);
        if (profile.talent_addr == voter && profile.credibility_score >= MIN_CREDIBILITY_TO_VOTE) {
            has_high_credibility = true;
            break
        };
        i = i + 1;
    };
    
    // Check client profiles if not found in talents
    if (!has_high_credibility) {
        i = 0;
        while (i < vector::length(&registry.client_profiles)) {
            let profile = vector::borrow(&registry.client_profiles, i);
            if (profile.client_addr == voter && profile.credibility_score >= MIN_CREDIBILITY_TO_VOTE) {
                has_high_credibility = true;
                break
            };
            i = i + 1;
        };
    };
    
    assert!(has_high_credibility, E_LOW_CREDIBILITY);
    
    if (vote_for_talent) {
        poll.votes_for_talent = poll.votes_for_talent + 1;
    } else {
        poll.votes_for_client = poll.votes_for_client + 1;
    };
    
    vector::push_back(&mut poll.voters, voter);
    
    event::emit(VoteCasted {
        poll_id: object::uid_to_address(&poll.id),
        voter,
        vote_for_talent,
    });
}

// Resolve dispute after voting ends
public fun resolve_dispute(
    poll: &mut Poll,
    gig: &mut Gig,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let current_time = clock::timestamp_ms(clock);
    assert!(current_time >= poll.end_time, E_POLL_NOT_ENDED);
    assert!(!poll.resolved, E_INVALID_STATE);
    
    poll.resolved = true;
    
    if (poll.votes_for_talent > poll.votes_for_client) {
        // Talent wins - distribute rewards
        poll.winner = option::some(poll.talent);
        let total_balance = balance::value(&gig.treasury_balance);
        let accepted_count = vector::length(&gig.accepted_talents);
        
        if (accepted_count > 0 && total_balance > 0) {
            let reward_per_talent = total_balance / accepted_count;
            let mut i = 0;
            while (i < accepted_count) {
                let talent = *vector::borrow(&gig.accepted_talents, i);
                let payment_balance = balance::split(&mut gig.treasury_balance, reward_per_talent);
                let payment_coin = coin::from_balance(payment_balance, ctx);
                transfer::public_transfer(payment_coin, talent);
                i = i + 1;
            };
        };
    } else {
        // Client wins - refund client
        poll.winner = option::some(poll.client);
        let refund_balance = balance::withdraw_all(&mut gig.treasury_balance);
        let refund_coin = coin::from_balance(refund_balance, ctx);
        transfer::public_transfer(refund_coin, gig.creator);
    };
    
    gig.state = GIG_CLOSED;
}

// Update credibility scores (called after dispute resolution)
public fun update_credibility_score(
    registry: &mut SwiftGigRegistry,
    user_addr: address,
    is_increase: bool,
    amount: u8,
) {
    let mut i = 0;
    let mut found = false;
    
    // Check talent profiles first
    while (i < vector::length(&registry.talent_profiles)) {
        let profile = vector::borrow_mut(&mut registry.talent_profiles, i);
        if (profile.talent_addr == user_addr) {
            if (is_increase) {
                let new_score = profile.credibility_score + amount;
                profile.credibility_score = if (new_score > 100) { 100 } else { new_score };
            } else {
                profile.credibility_score = if (profile.credibility_score < amount) { 0 } else { profile.credibility_score - amount };
            };
            found = true;
            break
        };
        i = i + 1;
    };
    
    // Check client profiles if not found in talents
    if (!found) {
        i = 0;
        while (i < vector::length(&registry.client_profiles)) {
            let profile = vector::borrow_mut(&mut registry.client_profiles, i);
            if (profile.client_addr == user_addr) {
                if (is_increase) {
                    let new_score = profile.credibility_score + amount;
                    profile.credibility_score = if (new_score > 100) { 100 } else { new_score };
                } else {
                    profile.credibility_score = if (profile.credibility_score < amount) { 0 } else { profile.credibility_score - amount };
                };
                break
            };
            i = i + 1;
        };
    };
}

// ========== VIEW FUNCTIONS FOR FRONTEND ==========

// Basic gig information
public fun get_gig_state(gig: &Gig): u8 {
    gig.state
}

public fun get_treasury_balance(gig: &Gig): u64 {
    balance::value(&gig.treasury_balance)
}

public fun get_waitlist(gig: &Gig): &vector<address> {
    &gig.waitlist
}

public fun get_accepted_talents(gig: &Gig): &vector<address> {
    &gig.accepted_talents
}

// Gig metadata (returns individual values, not tuples)
public fun get_gig_name(gig: &Gig): String {
    gig.metadata.name
}

public fun get_gig_description(gig: &Gig): String {
    gig.metadata.description
}

public fun get_gig_deadline(gig: &Gig): u64 {
    gig.metadata.deadline
}

public fun get_gig_talents_needed(gig: &Gig): u64 {
    gig.metadata.talents_needed
}

public fun get_gig_active_timeframe(gig: &Gig): u64 {
    gig.metadata.gig_active_timeframe
}

public fun get_gig_creator(gig: &Gig): address {
    gig.creator
}

public fun get_client_satisfaction(gig: &Gig): Option<bool> {
    gig.client_satisfaction
}

public fun get_unsatisfaction_reason(gig: &Gig): Option<String> {
    gig.unsatisfaction_reason
}

public fun is_gig_contested(gig: &Gig): bool {
    gig.contested
}

public fun get_poll_id(gig: &Gig): Option<address> {
    gig.poll_id
}

// Submission functions
public fun get_submissions_count(gig: &Gig): u64 {
    vector::length(&gig.submissions)
}

public fun get_submission_by_index(gig: &Gig, index: u64): (address, String, u64) {
    let submission = vector::borrow(&gig.submissions, index);
    (submission.talent, submission.submission_link, submission.timestamp)
}

public fun has_talent_submitted(gig: &Gig, talent_addr: address): bool {
    let mut i = 0;
    while (i < vector::length(&gig.submissions)) {
        let submission = vector::borrow(&gig.submissions, i);
        if (submission.talent == talent_addr) {
            return true
        };
        i = i + 1;
    };
    false
}

public fun get_talent_submission_link(gig: &Gig, talent_addr: address): Option<String> {
    let mut i = 0;
    while (i < vector::length(&gig.submissions)) {
        let submission = vector::borrow(&gig.submissions, i);
        if (submission.talent == talent_addr) {
            return option::some(submission.submission_link)
        };
        i = i + 1;
    };
    option::none()
}

public fun get_talent_submission_timestamp(gig: &Gig, talent_addr: address): Option<u64> {
    let mut i = 0;
    while (i < vector::length(&gig.submissions)) {
        let submission = vector::borrow(&gig.submissions, i);
        if (submission.talent == talent_addr) {
            return option::some(submission.timestamp)
        };
        i = i + 1;
    };
    option::none()
}

// Talent profile functions (individual getters)
public fun get_talent_full_name(registry: &SwiftGigRegistry, talent_addr: address): Option<String> {
    let mut i = 0;
    while (i < vector::length(&registry.talent_profiles)) {
        let profile = vector::borrow(&registry.talent_profiles, i);
        if (profile.talent_addr == talent_addr) {
            return option::some(profile.full_name)
        };
        i = i + 1;
    };
    option::none()
}

public fun get_talent_skill(registry: &SwiftGigRegistry, talent_addr: address): Option<String> {
    let mut i = 0;
    while (i < vector::length(&registry.talent_profiles)) {
        let profile = vector::borrow(&registry.talent_profiles, i);
        if (profile.talent_addr == talent_addr) {
            return option::some(profile.skill)
        };
        i = i + 1;
    };
    option::none()
}

public fun get_talent_preferred_mode(registry: &SwiftGigRegistry, talent_addr: address): Option<Preferred> {
    let mut i = 0;
    while (i < vector::length(&registry.talent_profiles)) {
        let profile = vector::borrow(&registry.talent_profiles, i);
        if (profile.talent_addr == talent_addr) {
            return option::some(profile.preferred_mode)
        };
        i = i + 1;
    };
    option::none()
}

public fun get_talent_credibility(registry: &SwiftGigRegistry, talent_addr: address): Option<u8> {
    let mut i = 0;
    while (i < vector::length(&registry.talent_profiles)) {
        let profile = vector::borrow(&registry.talent_profiles, i);
        if (profile.talent_addr == talent_addr) {
            return option::some(profile.credibility_score)
        };
        i = i + 1;
    };
    option::none()
}

// Client profile functions (individual getters)
public fun get_client_full_name(registry: &SwiftGigRegistry, client_addr: address): Option<String> {
    let mut i = 0;
    while (i < vector::length(&registry.client_profiles)) {
        let profile = vector::borrow(&registry.client_profiles, i);
        if (profile.client_addr == client_addr) {
            return option::some(profile.full_name)
        };
        i = i + 1;
    };
    option::none()
}

public fun get_client_extra_info(registry: &SwiftGigRegistry, client_addr: address): Option<String> {
    let mut i = 0;
    while (i < vector::length(&registry.client_profiles)) {
        let profile = vector::borrow(&registry.client_profiles, i);
        if (profile.client_addr == client_addr) {
            return option::some(profile.extra_info)
        };
        i = i + 1;
    };
    option::none()
}

public fun get_client_credibility(registry: &SwiftGigRegistry, client_addr: address): Option<u8> {
    let mut i = 0;
    while (i < vector::length(&registry.client_profiles)) {
        let profile = vector::borrow(&registry.client_profiles, i);
        if (profile.client_addr == client_addr) {
            return option::some(profile.credibility_score)
        };
        i = i + 1;
    };
    option::none()
}

// User registration checks
public fun is_talent_registered(registry: &SwiftGigRegistry, talent_addr: address): bool {
    let mut i = 0;
    while (i < vector::length(&registry.talent_profiles)) {
        let profile = vector::borrow(&registry.talent_profiles, i);
        if (profile.talent_addr == talent_addr) {
            return true
        };
        i = i + 1;
    };
    false
}

public fun is_client_registered(registry: &SwiftGigRegistry, client_addr: address): bool {
    let mut i = 0;
    while (i < vector::length(&registry.client_profiles)) {
        let profile = vector::borrow(&registry.client_profiles, i);
        if (profile.client_addr == client_addr) {
            return true
        };
        i = i + 1;
    };
    false
}

// Search functions
public fun get_talents_by_skill(registry: &SwiftGigRegistry, skill: String): vector<address> {
    let mut matching_talents = vector::empty<address>();
    let mut i = 0;
    while (i < vector::length(&registry.talent_profiles)) {
        let profile = vector::borrow(&registry.talent_profiles, i);
        if (profile.skill == skill) {
            vector::push_back(&mut matching_talents, profile.talent_addr);
        };
        i = i + 1;
    };
    matching_talents
}

// Gig status checks
public fun is_talent_in_waitlist(gig: &Gig, talent_addr: address): bool {
    vector::contains(&gig.waitlist, &talent_addr)
}

public fun is_talent_accepted(gig: &Gig, talent_addr: address): bool {
    vector::contains(&gig.accepted_talents, &talent_addr)
}

public fun get_waitlist_size(gig: &Gig): u64 {
    vector::length(&gig.waitlist)
}

public fun get_accepted_talents_count(gig: &Gig): u64 {
    vector::length(&gig.accepted_talents)
}

// Registry statistics
public fun get_total_talents(registry: &SwiftGigRegistry): u64 {
    vector::length(&registry.talent_profiles)
}

public fun get_total_clients(registry: &SwiftGigRegistry): u64 {
    vector::length(&registry.client_profiles)
}

public fun get_active_gigs_count(registry: &SwiftGigRegistry): u64 {
    vector::length(&registry.active_gigs)
}

public fun get_completed_gigs_count(registry: &SwiftGigRegistry): u64 {
    vector::length(&registry.completed_gigs)
}

// Poll-related functions
public fun get_poll_details(poll: &Poll): (address, address, String, String, u64, u64, bool) {
    (
        poll.talent,
        poll.client,
        poll.client_reason,
        poll.talent_reason,
        poll.start_time,
        poll.end_time,
        poll.resolved
    )
}

public fun get_poll_results(poll: &Poll): (u64, u64) {
    (poll.votes_for_talent, poll.votes_for_client)
}

public fun get_poll_winner(poll: &Poll): Option<address> {
    poll.winner
}

public fun has_user_voted(poll: &Poll, voter: address): bool {
    vector::contains(&poll.voters, &voter)
}

public fun get_poll_voters_count(poll: &Poll): u64 {
    vector::length(&poll.voters)
}

public fun is_poll_active(poll: &Poll, clock: &Clock): bool {
    let current_time = clock::timestamp_ms(clock);
    current_time >= poll.start_time && current_time < poll.end_time && !poll.resolved
}

public fun is_poll_ended(poll: &Poll, clock: &Clock): bool {
    let current_time = clock::timestamp_ms(clock);
    current_time >= poll.end_time
}

// Gig time checks
public fun is_gig_application_open(gig: &Gig, clock: &Clock): bool {
    let current_time = clock::timestamp_ms(clock);
    gig.state == GIG_ACTIVE && current_time < gig.metadata.gig_active_timeframe
}

public fun is_gig_submission_open(gig: &Gig, clock: &Clock): bool {
    let current_time = clock::timestamp_ms(clock);
    (gig.state == GIG_ACTIVE || gig.state == GIG_SUBMITTED) && 
    current_time < gig.metadata.deadline &&
    vector::length(&gig.accepted_talents) > 0
}

public fun is_gig_expired(gig: &Gig, clock: &Clock): bool {
    let current_time = clock::timestamp_ms(clock);
    current_time >= gig.metadata.deadline
}

// Helper for credibility check
public fun can_user_vote_in_disputes(registry: &SwiftGigRegistry, user_addr: address): bool {
    // Check talent profiles
    let mut i = 0;
    while (i < vector::length(&registry.talent_profiles)) {
        let profile = vector::borrow(&registry.talent_profiles, i);
        if (profile.talent_addr == user_addr && profile.credibility_score >= MIN_CREDIBILITY_TO_VOTE) {
            return true
        };
        i = i + 1;
    };
    
    // Check client profiles
    i = 0;
    while (i < vector::length(&registry.client_profiles)) {
        let profile = vector::borrow(&registry.client_profiles, i);
        if (profile.client_addr == user_addr && profile.credibility_score >= MIN_CREDIBILITY_TO_VOTE) {
            return true
        };
        i = i + 1;
    };
    
    false
}

// Get user type (returns 1 for talent, 2 for client, 0 for neither)
public fun get_user_type(registry: &SwiftGigRegistry, user_addr: address): u8 {
    // Check if talent
    let mut i = 0;
    while (i < vector::length(&registry.talent_profiles)) {
        let profile = vector::borrow(&registry.talent_profiles, i);
        if (profile.talent_addr == user_addr) {
            return 1 // Talent
        };
        i = i + 1;
    };
    
    // Check if client
    i = 0;
    while (i < vector::length(&registry.client_profiles)) {
        let profile = vector::borrow(&registry.client_profiles, i);
        if (profile.client_addr == user_addr) {
            return 2 // Client
        };
        i = i + 1;
    };
    
    0 // Neither
}