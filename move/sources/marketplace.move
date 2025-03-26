module nexus_syndicate::marketplace {
    use std::string::{Self, String};
    use std::signer;
    use std::vector;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::table::{Self, Table};

    // Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INSUFFICIENT_BALANCE: u64 = 2;
    const E_LISTING_NOT_FOUND: u64 = 3;
    const E_INVALID_AMOUNT: u64 = 4;
    const E_INVALID_PRICE: u64 = 5;
    const E_INSUFFICIENT_RESOURCES: u64 = 6;
    const E_RESOURCE_NOT_FOUND: u64 = 7;
    const E_NFT_NOT_FOUND: u64 = 8;
    const E_INVALID_STATE: u64 = 9;

    // Resource types
    struct Credits has key, store {
        value: u64
    }

    struct DataShards has key, store {
        value: u64
    }

    struct QuantumCores has key, store {
        value: u64
    }

    struct SyntheticAlloys has key, store {
        value: u64
    }

    // NFT struct
    struct NFT has key, store {
        id: u64,
        name: String,
        category: String,
        owner: address,
        metadata_uri: String
    }

    // Resource listing
    struct ResourceListing has store, drop {
        seller: address,
        resource_type: String,
        amount: u64,
        price_per_unit: u64,
        listing_id: u64,
        active: bool
    }

    // NFT listing
    struct NFTListing has store, drop {
        seller: address,
        nft_id: u64,
        price: u64,
        listing_id: u64,
        active: bool
    }

    // Marketplace state
    struct MarketplaceData has key {
        resource_listings: Table<u64, ResourceListing>,
        nft_listings: Table<u64, NFTListing>,
        next_listing_id: u64,
        resource_listing_events: EventHandle<ResourceListingEvent>,
        resource_purchase_events: EventHandle<ResourcePurchaseEvent>,
        nft_listing_events: EventHandle<NFTListingEvent>,
        nft_purchase_events: EventHandle<NFTPurchaseEvent>
    }

    // Events
    struct ResourceListingEvent has drop, store {
        listing_id: u64,
        seller: address,
        resource_type: String,
        amount: u64,
        price_per_unit: u64,
        timestamp: u64
    }

    struct ResourcePurchaseEvent has drop, store {
        listing_id: u64,
        buyer: address,
        seller: address,
        resource_type: String,
        amount: u64,
        price_per_unit: u64,
        total_price: u64,
        timestamp: u64
    }

    struct NFTListingEvent has drop, store {
        listing_id: u64,
        seller: address,
        nft_id: u64,
        price: u64,
        timestamp: u64
    }

    struct NFTPurchaseEvent has drop, store {
        listing_id: u64,
        buyer: address,
        seller: address,
        nft_id: u64,
        price: u64,
        timestamp: u64
    }

    // Initialize the marketplace
    fun init_module(account: &signer) {
        let marketplace_data = MarketplaceData {
            resource_listings: table::new(),
            nft_listings: table::new(),
            next_listing_id: 0,
            resource_listing_events: account::new_event_handle<ResourceListingEvent>(account),
            resource_purchase_events: account::new_event_handle<ResourcePurchaseEvent>(account),
            nft_listing_events: account::new_event_handle<NFTListingEvent>(account),
            nft_purchase_events: account::new_event_handle<NFTPurchaseEvent>(account)
        };

        move_to(account, marketplace_data);
    }

    // Initialize a user's resources
    public entry fun initialize_resources(account: &signer) {
        let addr = signer::address_of(account);
        
        if (!exists<Credits>(addr)) {
            move_to(account, Credits { value: 1000 }); // Start with 1000 credits
        };
        
        if (!exists<DataShards>(addr)) {
            move_to(account, DataShards { value: 50 }); // Start with 50 data shards
        };
        
        if (!exists<QuantumCores>(addr)) {
            move_to(account, QuantumCores { value: 25 }); // Start with 25 quantum cores
        };
        
        if (!exists<SyntheticAlloys>(addr)) {
            move_to(account, SyntheticAlloys { value: 75 }); // Start with 75 synthetic alloys
        };
    }

    // List a resource for sale
    public entry fun list_resource(
        account: &signer,
        resource_type: String,
        price_per_unit: u64,
        amount: u64
    ) acquires MarketplaceData, Credits, DataShards, QuantumCores, SyntheticAlloys {
        let seller = signer::address_of(account);
        
        // Verify the user has enough resources
        assert!(has_sufficient_resources(seller, resource_type, amount), E_INSUFFICIENT_RESOURCES);
        assert!(amount > 0, E_INVALID_AMOUNT);
        assert!(price_per_unit > 0, E_INVALID_PRICE);
        
        // Deduct the resources from the seller
        deduct_resources(seller, resource_type, amount);
        
        // Create the listing
        let marketplace_data = borrow_global_mut<MarketplaceData>(@nexus_syndicate);
        let listing_id = marketplace_data.next_listing_id;
        marketplace_data.next_listing_id = listing_id + 1;
        
        let resource_listing = ResourceListing {
            seller,
            resource_type: resource_type,
            amount,
            price_per_unit,
            listing_id,
            active: true
        };
        
        table::add(&mut marketplace_data.resource_listings, listing_id, resource_listing);
        
        // Emit listing event
        event::emit_event(
            &mut marketplace_data.resource_listing_events,
            ResourceListingEvent {
                listing_id,
                seller,
                resource_type,
                amount,
                price_per_unit,
                timestamp: timestamp::now_seconds()
            }
        );
    }

    // Buy a resource from the marketplace
    public entry fun buy_resource(
        buyer: &signer,
        listing_id: u64,
        amount: u64
    ) acquires MarketplaceData, Credits, DataShards, QuantumCores, SyntheticAlloys {
        let buyer_addr = signer::address_of(buyer);
        let marketplace_data = borrow_global_mut<MarketplaceData>(@nexus_syndicate);
        
        // Verify the listing exists
        assert!(table::contains(&marketplace_data.resource_listings, listing_id), E_LISTING_NOT_FOUND);
        
        let listing = table::borrow_mut(&mut marketplace_data.resource_listings, listing_id);
        assert!(listing.active, E_LISTING_NOT_FOUND);
        assert!(amount > 0 && amount <= listing.amount, E_INVALID_AMOUNT);
        
        let total_price = amount * listing.price_per_unit;
        
        // Verify buyer has enough credits
        assert!(has_sufficient_credits(buyer_addr, total_price), E_INSUFFICIENT_BALANCE);
        
        // Transfer credits from buyer to seller
        transfer_credits(buyer_addr, listing.seller, total_price);
        
        // Transfer resources to buyer
        add_resources(buyer_addr, listing.resource_type, amount);
        
        // Update the listing
        if (amount == listing.amount) {
            listing.active = false;
        } else {
            listing.amount = listing.amount - amount;
        };
        
        // Emit purchase event
        event::emit_event(
            &mut marketplace_data.resource_purchase_events,
            ResourcePurchaseEvent {
                listing_id,
                buyer: buyer_addr,
                seller: listing.seller,
                resource_type: listing.resource_type,
                amount,
                price_per_unit: listing.price_per_unit,
                total_price,
                timestamp: timestamp::now_seconds()
            }
        );
    }

    // List an NFT for sale
    public entry fun sell_nft(
        account: &signer,
        nft_id: u64,
        price: u64
    ) acquires MarketplaceData, NFT {
        let seller = signer::address_of(account);
        
        // Verify the user owns the NFT
        assert!(exists<NFT>(seller), E_NFT_NOT_FOUND);
        let nft = borrow_global<NFT>(seller);
        assert!(nft.id == nft_id, E_NFT_NOT_FOUND);
        assert!(nft.owner == seller, E_NOT_AUTHORIZED);
        assert!(price > 0, E_INVALID_PRICE);
        
        // Create the listing
        let marketplace_data = borrow_global_mut<MarketplaceData>(@nexus_syndicate);
        let listing_id = marketplace_data.next_listing_id;
        marketplace_data.next_listing_id = listing_id + 1;
        
        let nft_listing = NFTListing {
            seller,
            nft_id,
            price,
            listing_id,
            active: true
        };
        
        table::add(&mut marketplace_data.nft_listings, listing_id, nft_listing);
        
        // Emit listing event
        event::emit_event(
            &mut marketplace_data.nft_listing_events,
            NFTListingEvent {
                listing_id,
                seller,
                nft_id,
                price,
                timestamp: timestamp::now_seconds()
            }
        );
    }

    // Buy an NFT from the marketplace
    public entry fun buy_nft(
        buyer: &signer,
        listing_id: u64
    ) acquires MarketplaceData, Credits, NFT {
        let buyer_addr = signer::address_of(buyer);
        let marketplace_data = borrow_global_mut<MarketplaceData>(@nexus_syndicate);
        
        // Verify the listing exists
        assert!(table::contains(&marketplace_data.nft_listings, listing_id), E_LISTING_NOT_FOUND);
        
        let listing = table::borrow_mut(&mut marketplace_data.nft_listings, listing_id);
        assert!(listing.active, E_LISTING_NOT_FOUND);
        
        // Verify buyer has enough credits
        assert!(has_sufficient_credits(buyer_addr, listing.price), E_INSUFFICIENT_BALANCE);
        
        // Transfer credits from buyer to seller
        transfer_credits(buyer_addr, listing.seller, listing.price);
        
        // Transfer NFT ownership
        let nft = borrow_global_mut<NFT>(listing.seller);
        nft.owner = buyer_addr;
        
        // Mark listing as inactive
        listing.active = false;
        
        // Emit purchase event
        event::emit_event(
            &mut marketplace_data.nft_purchase_events,
            NFTPurchaseEvent {
                listing_id,
                buyer: buyer_addr,
                seller: listing.seller,
                nft_id: listing.nft_id,
                price: listing.price,
                timestamp: timestamp::now_seconds()
            }
        );
    }

    // Helper functions
    fun has_sufficient_resources(addr: address, resource_type: String, amount: u64): bool acquires Credits, DataShards, QuantumCores, SyntheticAlloys {
        if (resource_type == string::utf8(b"credits")) {
            return exists<Credits>(addr) && borrow_global<Credits>(addr).value >= amount
        } else if (resource_type == string::utf8(b"data_shards")) {
            return exists<DataShards>(addr) && borrow_global<DataShards>(addr).value >= amount
        } else if (resource_type == string::utf8(b"quantum_cores")) {
            return exists<QuantumCores>(addr) && borrow_global<QuantumCores>(addr).value >= amount
        } else if (resource_type == string::utf8(b"synthetic_alloys")) {
            return exists<SyntheticAlloys>(addr) && borrow_global<SyntheticAlloys>(addr).value >= amount
        } else {
            return false
        }
    }

    fun has_sufficient_credits(addr: address, amount: u64): bool acquires Credits {
        exists<Credits>(addr) && borrow_global<Credits>(addr).value >= amount
    }

    fun deduct_resources(addr: address, resource_type: String, amount: u64) acquires Credits, DataShards, QuantumCores, SyntheticAlloys {
        if (resource_type == string::utf8(b"credits")) {
            let credits = borrow_global_mut<Credits>(addr);
            credits.value = credits.value - amount;
        } else if (resource_type == string::utf8(b"data_shards")) {
            let shards = borrow_global_mut<DataShards>(addr);
            shards.value = shards.value - amount;
        } else if (resource_type == string::utf8(b"quantum_cores")) {
            let cores = borrow_global_mut<QuantumCores>(addr);
            cores.value = cores.value - amount;
        } else if (resource_type == string::utf8(b"synthetic_alloys")) {
            let alloys = borrow_global_mut<SyntheticAlloys>(addr);
            alloys.value = alloys.value - amount;
        } else {
            abort E_RESOURCE_NOT_FOUND
        }
    }

    fun add_resources(addr: address, resource_type: String, amount: u64) acquires Credits, DataShards, QuantumCores, SyntheticAlloys {
        if (resource_type == string::utf8(b"credits")) {
            let credits = borrow_global_mut<Credits>(addr);
            credits.value = credits.value + amount;
        } else if (resource_type == string::utf8(b"data_shards")) {
            let shards = borrow_global_mut<DataShards>(addr);
            shards.value = shards.value + amount;
        } else if (resource_type == string::utf8(b"quantum_cores")) {
            let cores = borrow_global_mut<QuantumCores>(addr);
            cores.value = cores.value + amount;
        } else if (resource_type == string::utf8(b"synthetic_alloys")) {
            let alloys = borrow_global_mut<SyntheticAlloys>(addr);
            alloys.value = alloys.value + amount;
        } else {
            abort E_RESOURCE_NOT_FOUND
        }
    }

    fun transfer_credits(from: address, to: address, amount: u64) acquires Credits {
        let from_credits = borrow_global_mut<Credits>(from);
        from_credits.value = from_credits.value - amount;
        
        let to_credits = borrow_global_mut<Credits>(to);
        to_credits.value = to_credits.value + amount;
    }
}
