module nexus_syndicates::marketplace {
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::coin;
    use aptos_framework::account;
    use aptos_std::table::{Self, Table};
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::aptos_coin::AptosCoin;
    
    // Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INSUFFICIENT_BALANCE: u64 = 2;
    const E_RESOURCE_NOT_FOUND: u64 = 3;
    const E_NFT_NOT_FOUND: u64 = 4;
    const E_INSUFFICIENT_QUANTITY: u64 = 5;
    const E_ALREADY_LISTED: u64 = 6;
    const E_NOT_LISTED: u64 = 7;
    
    // Resource struct for game resources
    struct Resource has key, store {
        resource_type: String,
        quantity: u64,
    }
    
    // NFT struct
    struct NFT has key, store {
        id: u64,
        name: String,
        description: String,
        category: String,
        rarity: String,
        owner: address,
    }
    
    // Marketplace listing for resources
    struct ResourceListing has key, store {
        resource_type: String,
        price_per_unit: u64,
        available_quantity: u64,
    }
    
    // Marketplace listing for NFTs
    struct NFTListing has key, store {
        nft_id: u64,
        price: u64,
    }
    
    // Marketplace state
    struct MarketplaceState has key {
        resource_listings: Table<String, ResourceListing>,
        nft_listings: Table<u64, NFTListing>,
        resource_sale_events: EventHandle<ResourceSaleEvent>,
        nft_sale_events: EventHandle<NFTSaleEvent>,
    }
    
    // Player inventory
    struct PlayerInventory has key {
        resources: Table<String, Resource>,
        nfts: Table<u64, NFT>,
    }
    
    // Events
    struct ResourceSaleEvent has drop, store {
        buyer: address,
        seller: address,
        resource_type: String,
        quantity: u64,
        total_price: u64,
    }
    
    struct NFTSaleEvent has drop, store {
        buyer: address,
        seller: address,
        nft_id: u64,
        price: u64,
    }
    
    // Initialize marketplace
    public entry fun initialize_marketplace(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        // Create marketplace state
        move_to(admin, MarketplaceState {
            resource_listings: table::new(),
            nft_listings: table::new(),
            resource_sale_events: account::new_event_handle<ResourceSaleEvent>(admin),
            nft_sale_events: account::new_event_handle<NFTSaleEvent>(admin),
        });
    }
    
    // Initialize player inventory
    public entry fun initialize_player(player: &signer) {
        let player_addr = signer::address_of(player);
        
        if (!exists<PlayerInventory>(player_addr)) {
            move_to(player, PlayerInventory {
                resources: table::new(),
                nfts: table::new(),
            });
        }
    }
    
    // List resource for sale
    public entry fun list_resource(
        seller: &signer,
        resource_type: String,
        price_per_unit: u64,
        quantity: u64
    ) acquires PlayerInventory, MarketplaceState {
        let seller_addr = signer::address_of(seller);
        
        // Check if player has inventory
        assert!(exists<PlayerInventory>(seller_addr), E_NOT_AUTHORIZED);
        
        // Get player inventory
        let player_inventory = borrow_global_mut<PlayerInventory>(seller_addr);
        
        // Check if player has the resource
        assert!(table::contains(&player_inventory.resources, resource_type), E_RESOURCE_NOT_FOUND);
        
        // Get resource from player inventory
        let player_resource = table::borrow_mut(&mut player_inventory.resources, resource_type);
        
        // Check if player has enough quantity
        assert!(player_resource.quantity >= quantity, E_INSUFFICIENT_QUANTITY);
        
        // Reduce player's resource quantity
        player_resource.quantity = player_resource.quantity - quantity;
        
        // Get marketplace state
        let marketplace = borrow_global_mut<MarketplaceState>(@nexus_syndicates);
        
        // Add or update listing
        if (table::contains(&marketplace.resource_listings, resource_type)) {
            let listing = table::borrow_mut(&mut marketplace.resource_listings, resource_type);
            listing.available_quantity = listing.available_quantity + quantity;
            listing.price_per_unit = price_per_unit; // Update price
        } else {
            let new_listing = ResourceListing {
                resource_type: resource_type,
                price_per_unit: price_per_unit,
                available_quantity: quantity,
            };
            table::add(&mut marketplace.resource_listings, resource_type, new_listing);
        }
    }
    
    // Buy resource
    public entry fun buy_resource(
        buyer: &signer,
        resource_type: String,
        quantity: u64
    ) acquires MarketplaceState, PlayerInventory {
        let buyer_addr = signer::address_of(buyer);
        
        // Check if marketplace exists
        assert!(exists<MarketplaceState>(@nexus_syndicates), E_NOT_AUTHORIZED);
        
        // Get marketplace state
        let marketplace = borrow_global_mut<MarketplaceState>(@nexus_syndicates);
        
        // Check if resource is listed
        assert!(table::contains(&marketplace.resource_listings, resource_type), E_RESOURCE_NOT_FOUND);
        
        // Get resource listing
        let listing = table::borrow_mut(&mut marketplace.resource_listings, resource_type);
        
        // Check if enough quantity is available
        assert!(listing.available_quantity >= quantity, E_INSUFFICIENT_QUANTITY);
        
        // Calculate total price
        let total_price = listing.price_per_unit * quantity;
        
        // Transfer APT from buyer to contract
        coin::transfer<AptosCoin>(buyer, @nexus_syndicates, total_price);
        
        // Update listing quantity
        listing.available_quantity = listing.available_quantity - quantity;
        
        // Initialize player inventory if not exists
        if (!exists<PlayerInventory>(buyer_addr)) {
            move_to(buyer, PlayerInventory {
                resources: table::new(),
                nfts: table::new(),
            });
        }
        
        // Get player inventory
        let player_inventory = borrow_global_mut<PlayerInventory>(buyer_addr);
        
        // Add resource to player inventory
        if (table::contains(&player_inventory.resources, resource_type)) {
            let player_resource = table::borrow_mut(&mut player_inventory.resources, resource_type);
            player_resource.quantity = player_resource.quantity + quantity;
        } else {
            let new_resource = Resource {
                resource_type: resource_type,
                quantity: quantity,
            };
            table::add(&mut player_inventory.resources, resource_type, new_resource);
        }
        
        // Emit event
        event::emit_event(
            &mut marketplace.resource_sale_events,
            ResourceSaleEvent {
                buyer: buyer_addr,
                seller: @nexus_syndicates,
                resource_type: resource_type,
                quantity: quantity,
                total_price: total_price,
            }
        );
    }
    
    // List NFT for sale
    public entry fun list_nft(
        seller: &signer,
        nft_id: u64,
        price: u64
    ) acquires PlayerInventory, MarketplaceState {
        let seller_addr = signer::address_of(seller);
        
        // Check if player has inventory
        assert!(exists<PlayerInventory>(seller_addr), E_NOT_AUTHORIZED);
        
        // Get player inventory
        let player_inventory = borrow_global_mut<PlayerInventory>(seller_addr);
        
        // Check if player has the NFT
        assert!(table::contains(&player_inventory.nfts, nft_id), E_NFT_NOT_FOUND);
        
        // Get NFT from player inventory
        let nft = table::remove(&mut player_inventory.nfts, nft_id);
        
        // Get marketplace state
        let marketplace = borrow_global_mut<MarketplaceState>(@nexus_syndicates);
        
        // Check if NFT is already listed
        assert!(!table::contains(&marketplace.nft_listings, nft_id), E_ALREADY_LISTED);
        
        // Add NFT listing
        let new_listing = NFTListing {
            nft_id: nft_id,
            price: price,
        };
        table::add(&mut marketplace.nft_listings, nft_id, new_listing);
        
        // Store NFT in marketplace (in a real implementation, we would use a separate table)
        // For simplicity, we're just removing it from the player's inventory
    }
    
    // Buy NFT
    public entry fun buy_nft(
        buyer: &signer,
        nft_id: u64
    ) acquires MarketplaceState, PlayerInventory {
        let buyer_addr = signer::address_of(buyer);
        
        // Check if marketplace exists
        assert!(exists<MarketplaceState>(@nexus_syndicates), E_NOT_AUTHORIZED);
        
        // Get marketplace state
        let marketplace = borrow_global_mut<MarketplaceState>(@nexus_syndicates);
        
        // Check if NFT is listed
        assert!(table::contains(&marketplace.nft_listings, nft_id), E_NFT_NOT_FOUND);
        
        // Get NFT listing
        let listing = table::remove(&mut marketplace.nft_listings, nft_id);
        
        // Transfer APT from buyer to contract
        coin::transfer<AptosCoin>(buyer, @nexus_syndicates, listing.price);
        
        // Initialize player inventory if not exists
        if (!exists<PlayerInventory>(buyer_addr)) {
            move_to(buyer, PlayerInventory {
                resources: table::new(),
                nfts: table::new(),
            });
        }
        
        // Get player inventory
        let player_inventory = borrow_global_mut<PlayerInventory>(buyer_addr);
        
        // Create NFT with new owner
        let nft = NFT {
            id: nft_id,
            name: string::utf8(b"Sample NFT"), // In a real implementation, we would retrieve this from storage
            description: string::utf8(b"Sample Description"),
            category: string::utf8(b"Sample Category"),
            rarity: string::utf8(b"Rare"),
            owner: buyer_addr,
        };
        
        // Add NFT to player inventory
        table::add(&mut player_inventory.nfts, nft_id, nft);
        
        // Emit event
        event::emit_event(
            &mut marketplace.nft_sale_events,
            NFTSaleEvent {
                buyer: buyer_addr,
                seller: @nexus_syndicates,
                nft_id: nft_id,
                price: listing.price,
            }
        );
    }
    
    // Get player resources (view function)
    #[view]
    public fun get_player_resources(player_addr: address, resource_type: String): u64 acquires PlayerInventory {
        if (!exists<PlayerInventory>(player_addr)) {
            return 0
        };
        
        let player_inventory = borrow_global<PlayerInventory>(player_addr);
        
        if (!table::contains(&player_inventory.resources, resource_type)) {
            return 0
        };
        
        let resource = table::borrow(&player_inventory.resources, resource_type);
        resource.quantity
    }
    
    // Check if player owns NFT (view function)
    #[view]
    public fun player_owns_nft(player_addr: address, nft_id: u64): bool acquires PlayerInventory {
        if (!exists<PlayerInventory>(player_addr)) {
            return false
        };
        
        let player_inventory = borrow_global<PlayerInventory>(player_addr);
        table::contains(&player_inventory.nfts, nft_id)
    }
}
