'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) { /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

        let products = [
            {
                id: 1,
                name: "Cattle",
                description: "",
                code: ""

            },
            {
                id: 2,
                name: "Cocoa",
                description: "",
                code: ""

            },
            {
                id: 3,
                name: "Coffee",
                description: "",
                code: ""

            },
            {
                id: 4,
                name: "Oil palm",
                description: "",
                code: ""

            }, {
                id: 5,
                name: "Rubber",
                description: "",
                code: ""

            }, {
                id: 6,
                name: "Soya",
                description: "",
                code: ""

            }, {
                id: 7,
                name: "Wood",
                description: "",
                code: ""

            },
        ]


        const subProducts = [
            {
                name: "0102 21 , 0102 29 Live cattle",
                description: "",
                code: "",
                productId: 1
            },
            {
                name: "ex 0201 Meat of cattle, fresh or chilled",
                description: "",
                code: "",
                productId: 1
            },
            {
                name: "ex 0202 Meat of cattle, frozen",
                description: "",
                code: "",
                productId: 1
            },
            {
                name: "ex 0206 10 Edible offal of cattle, fresh or chilled",
                description: "",
                code: "",
                productId: 1
            }, {
                name: "ex 0206 22 Edible cattle livers, frozen",
                description: "",
                code: "",
                productId: 1
            }, {
                name: "ex 0206 29 Edible cattle offal (excluding tongues and livers), frozen",
                description: "",
                code: "",
                productId: 1
            }, {
                name: "ex 1602 50 Other prepared or preserved meat, meat offal, blood, of cattle",
                description: "",
                code: "",
                productId: 1
            }, {
                name: "ex 4101 Raw hides and skins of cattle (fresh, or salted, dried, limed, pickled or otherwise preserved, but not tanned, parchment-dressed or further prepared), whether or not dehaired or split",
                description: "",
                code: "",
                productId: 1
            }, {
                name: "ex 4104 Tanned or crust hides and skins of cattle, without hair on, whether or not split, but not further prepared",
                description: "",
                code: "",
                productId: 1
            }, {
                name: "ex 4107 Leather of cattle, further prepared after tanning or crusting, including parchment-dressed leather, without hair on, whether or not split, other than leather of heading 4114",
                description: "",
                code: "",
                productId: 1
            }, {
                name: "1801 Cocoa beans, whole or broken, raw or roasted",
                description: "",
                code: "",
                productId: 2
            }, {
                name: "1802 Cocoa shells, husks, skins and other cocoa waste",
                description: "",
                code: "",
                productId: 2
            }, {
                name: "1803 Cocoa paste, whether or not defatted",
                description: "",
                code: "",
                productId: 2
            }, {
                name: "1804 Cocoa butter, fat and oil",
                description: "",
                code: "",
                productId: 2
            }, {
                name: "1805 Cocoa powder, not containing added sugar or other sweetening matter",
                description: "",
                code: "",
                productId: 2
            }, {
                name: "1806 Chocolate and other food preparations containing cocoa",
                description: "",
                code: "",
                productId: 2
            }, {
                name: "0901 Coffee, whether or not roasted or decaffeinated; coffee husks and skins; coffee substitutes containing coffee in any proportion",
                description: "",
                code: "",
                productId: 3
            }, {
                name: "1207 10 Palm nuts and kernels",
                description: "",
                code: "",
                productId: 4
            }, {
                name: "1511 Palm oil and its fractions, whether or not refined, but not chemically modified",
                description: "",
                code: "",
                productId: 4
            }, {
                name: "1513 21 Crude palm kernel and babassu oil and fractions thereof, whether or not refined, but not chemically modified",
                description: "",
                code: "",
                productId: 4
            }, {
                name: "1513 29 Palm kernel and babassu oil and their fractions, whether or not refined, but not chemically modified (excluding crude oil)",
                description: "",
                code: "",
                productId: 4
            }, {
                name: "2306 60 Oilcake and other solid residues of palm nuts or kernels, whether or not ground or in the form of pellets, resulting from the extraction of palm nut or kernel fats or oils",
                description: "",
                code: "",
                productId: 4
            }, {
                name: "ex 2905 45 Glycerol, with a purity of 95 % or more (calculated on the weight of the dry product)",
                description: "",
                code: "",
                productId: 4
            }, {
                name: "2915 70 Palmitic acid, stearic acid, their salts and esters",
                description: "",
                code: "",
                productId: 4
            }, {
                name: "2915 90 Saturated acyclic monocarboxylic acids, their anhydrides, halides, peroxides and peroxyacids; their halogenated, sulphonated, nitrated or nitrosated derivatives (excluding formic acid, acetic acid, mono-, di- or trichloroacetic acids, propionic acid, butanoic acids, pentanoic acids, palmitic acid, stearic acid, their salts and esters, and acetic anhydride)",
                description: "",
                code: "",
                productId: 4
            }, {
                name: "3823 11 Stearic acid, industrial",
                description: "",
                code: "",
                productId: 4
            }, {
                name: "3823 12 Oleic acid, industrial",
                description: "",
                code: "",
                productId: 4
            }, {
                name: "3823 19 Industrial monocarboxylic fatty acids; acid oils from refining (excluding stearic acid, oleic acid and tall oil fatty acids)",
                description: "",
                code: "",
                productId: 4
            }, {
                name: "3823 70 Industrial fatty alcohols",
                description: "",
                code: "",
                productId: 4
            }, {
                name: "4001 Natural rubber, balata, gutta-percha, guayule, chicle and similar natural gums, in primary forms or in plates, sheets or strip",
                description: "",
                code: "",
                productId: 5
            }, {
                name: "ex 4005 Compounded rubber, unvulcanised, in primary forms or in plates, sheets or strip",
                description: "",
                code: "",
                productId: 5
            }, {
                name: "ex 4006 Unvulcanised rubber in other forms (e.g. rods, tubes and profile shapes) and articles (e.g. discs and rings)",
                description: "",
                code: "",
                productId: 5
            }, {
                name: "ex 4007 Vulcanised rubber thread and cord",
                description: "",
                code: "",
                productId: 5
            }, {
                name: "ex 4008 Plates, sheets, strips, rods and profile shapes, of vulcanised rubber other than hard rubber",
                description: "",
                code: "",
                productId: 5
            }, {
                name: "ex 4010 Conveyer or transmission belts or belting, of vulcanised rubber",
                description: "",
                code: "",
                productId: 5
            }, {
                name: "ex 4011 New pneumatic tyres, of rubber",
                description: "",
                code: "",
                productId: 5
            }, {
                name: "ex 4012 Retreaded or used pneumatic tyres of rubber; solid or cushion tyres, tyre treads and tyre flaps, of rubber",
                description: "",
                code: "",
                productId: 5
            }, {
                name: "ex 4013 Inner tubes, of rubber",
                description: "",
                code: "",
                productId: 5
            }, {
                name: "ex 4015 Articles of apparel and clothing accessories (including gloves, mittens and mitts), for all purposes, of vulcanised rubber other than hard rubber",
                description: "",
                code: "",
                productId: 5
            }, {
                name: "ex 4016 Other articles of vulcanised rubber other than hard rubber, not elsewhere specified in chapter 40",
                description: "",
                code: "",
                productId: 5
            }, {
                name: "ex 4017 Hard rubber (e.g. ebonite) in all forms including waste and scrap; articles of hard rubber",
                description: "",
                code: "",
                productId: 5
            }, {
                name: "1201 Soya beans, whether or not broken",
                description: "",
                code: "",
                productId: 6
            }, {
                name: "1208 10 Soya bean flour and meal",
                description: "",
                code: "",
                productId: 6
            }, {
                name: "1507 Soya-bean oil and its fractions, whether or not refined, but not chemically modified",
                description: "",
                code: "",
                productId: 6
            }, {
                name: "2304 Oilcake and other solid residues, whether or not ground or in the form of pellets, resulting from the extraction of soya-bean oil",
                description: "",
                code: "",
                productId: 6
            }, {
                name: "4401 Fuel wood, in logs, in billets, in twigs, in faggots or in similar forms; wood in chips or particles; sawdust and wood waste and scrap, whether or not agglomerated in logs, briquettes, pellets or similar forms",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "4402 Wood charcoal (including shell or nut charcoal), whether or not agglomerated",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "4403 Wood in the rough, whether or not stripped of bark or sapwood, or roughly squared",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "4404 Hoopwood; split poles; piles, pickets and stakes of wood, pointed but not sawn lengthwise; wooden sticks, roughly trimmed but not turned, bent or otherwise worked, suitable for the manufacture of walking sticks, umbrellas, tool handles or the like; chipwood and the like",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "4405 Wood wool; wood flour",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "4406 Railway or tramway sleepers (cross-ties) of wood",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "4407 Wood sawn or chipped lengthwise, sliced or peeled, whether or not planed, sanded or end-jointed, of a thickness exceeding 6 mm",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "4408 Sheets for veneering (including those obtained by slicing laminated wood), for plywood or for other similar laminated wood and other wood, sawn lengthwise, sliced or peeled, whether or not planed, sanded, spliced or end-jointed, of a thickness not exceeding 6 mm",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "4409 Wood (including strips and friezes for parquet flooring, not assembled) continuously shaped (tongued, grooved, rebated, chamfered, V-jointed, beaded, moulded, rounded or the like) along any of its edges, ends or faces, whether or not planed, sanded or end-jointed",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "4410 Particle board, oriented strand board (OSB) and similar board (for example, waferboard) of wood or other ligneous materials, whether or not agglomerated with resins or other organic binding substances",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "4411 Fibreboard of wood or other ligneous materials, whether or not bonded with resins or other organic substances",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "4412 Plywood, veneered panels and similar laminated wood",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "4413 Densified wood, in blocks, plates, strips or profile shapes",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "4414 Wooden frames for paintings, photographs, mirrors or similar objects",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "4415 Packing cases, boxes, crates, drums and similar packings, of wood; cable-drums of wood; pallets, box pallets and other load boards, of wood;",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "pallet collars of wood(not including packing material used exclusively as packing material to support, protect or carry another product placed on the market)",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "4416 Casks, barrels, vats, tubs and other coopers’ products and parts thereof, of wood, including staves",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "4417 Tools, tool bodies, tool handles, broom or brush bodies and handles, of wood; boot or shoe lasts and trees, of wood",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "4418 Builders’ joinery and carpentry of wood, including cellular wood panels, assembled flooring panels, shingles and shakes",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "4419 Tableware and kitchenware, of wood",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "4420 Wood marquetry and inlaid wood; caskets and cases for jewellery or cutlery, and similar articles, of wood; statuettes and other ornaments, of wood; wooden articles of furniture not falling in Chapter 94",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "4421 Other articles of wood",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "Pulp and paper of Chapters 47 and 48 of the Combined Nomenclature, with the exception of bamboo-based and recovered (waste and scrap) products",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "ex 49 Printed books, newspapers, pictures and other products of the printing industry, manuscripts, typescripts and plans, of paper",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "ex 9401 Seats (other than those of heading 9402 ), whether or not convertible into beds, and parts thereof, of wood",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "9403 30 , 9403 40 , 9403 50 , 9403 60 and 9403 91 Wooden furniture, and parts thereof",
                description: "",
                code: "",
                productId: 7
            }, {
                name: "9406 10 Prefabricated buildings of wood",
                description: "",
                code: "",
                productId: 7
            },

        ]

        await queryInterface.bulkInsert('products', products, {});
        await queryInterface.bulkInsert('sub_products', subProducts, {});

    },

    async down(queryInterface, Sequelize) { /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

        await queryInterface.bulkDelete('products', null, {});
        await queryInterface.bulkDelete('sub_products', null, {});
    }
};
