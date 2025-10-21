'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ADDED products & subproducts just for organization 7
    let products = [
      {
        id: 1,
        name: "Cattle",
        productType: 'global'
      },
      {
        id: 2,
        name: "Cocoa",
        productType: 'global'
      },
      {
        id: 3,
        name: "Coffee",
        productType: 'global'
      },
      {
        id: 4,
        name: "Oil palm",
        productType: 'global'
      }, {
        id: 5,
        name: "Rubber",
        productType: 'global'
      }, {
        id: 6,
        name: "Soya",
        productType: 'global'
      }, {
        id: 7,
        name: "Wood",
        productType: 'global'
      },
    ]

    const subProducts = [
      {
        name: "0102 21 , 0102 29 Live cattle",
        subProductType: 'global',
        productId: 1
      },
      {
        name: "ex 0201 Meat of cattle, fresh or chilled",
        subProductType: 'global',
        productId: 1
      },
      {
        name: "ex 0202 Meat of cattle, frozen",
        subProductType: 'global',
        productId: 1
      },
      {
        name: "ex 0206 10 Edible offal of cattle, fresh or chilled",
        subProductType: 'global',
        productId: 1
      }, {
        name: "ex 0206 22 Edible cattle livers, frozen",
        subProductType: 'global',
        productId: 1
      }, {
        name: "ex 0206 29 Edible cattle offal (excluding tongues and livers), frozen",
        subProductType: 'global',
        productId: 1
      }, {
        name: "ex 1602 50 Other prepared or preserved meat, meat offal, blood, of cattle",
        subProductType: 'global',
        productId: 1
      }, {
        name: "ex 4101 Raw hides and skins of cattle (fresh, or salted, dried, limed, pickled or otherwise preserved, but not tanned, parchment-dressed or further prepared), whether or not dehaired or split",
        subProductType: 'global',
        productId: 1
      }, {
        name: "ex 4104 Tanned or crust hides and skins of cattle, without hair on, whether or not split, but not further prepared",
        subProductType: 'global',
        productId: 1
      }, {
        name: "ex 4107 Leather of cattle, further prepared after tanning or crusting, including parchment-dressed leather, without hair on, whether or not split, other than leather of heading 4114",
        subProductType: 'global',
        productId: 1
      }, {
        name: "1801 Cocoa beans, whole or broken, raw or roasted",
        subProductType: 'global',
        productId: 2
      }, {
        name: "1802 Cocoa shells, husks, skins and other cocoa waste",
        subProductType: 'global',
        productId: 2
      }, {
        name: "1803 Cocoa paste, whether or not defatted",
        subProductType: 'global',
        productId: 2
      }, {
        name: "1804 Cocoa butter, fat and oil",
        subProductType: 'global',
        productId: 2
      }, {
        name: "1805 Cocoa powder, not containing added sugar or other sweetening matter",
        subProductType: 'global',
        productId: 2
      }, {
        name: "1806 Chocolate and other food preparations containing cocoa",
        subProductType: 'global',
        productId: 2
      }, {
        name: "0901 Coffee, whether or not roasted or decaffeinated; coffee husks and skins; coffee substitutes containing coffee in any proportion",
        subProductType: 'global',
        productId: 3
      }, {
        name: "1207 10 Palm nuts and kernels",
        subProductType: 'global',
        productId: 4
      }, {
        name: "1511 Palm oil and its fractions, whether or not refined, but not chemically modified",
        subProductType: 'global',
        productId: 4
      }, {
        name: "1513 21 Crude palm kernel and babassu oil and fractions thereof, whether or not refined, but not chemically modified",
        subProductType: 'global',
        productId: 4
      }, {
        name: "1513 29 Palm kernel and babassu oil and their fractions, whether or not refined, but not chemically modified (excluding crude oil)",
        subProductType: 'global',
        productId: 4
      }, {
        name: "2306 60 Oilcake and other solid residues of palm nuts or kernels, whether or not ground or in the form of pellets, resulting from the extraction of palm nut or kernel fats or oils",
        subProductType: 'global',
        productId: 4
      }, {
        name: "ex 2905 45 Glycerol, with a purity of 95 % or more (calculated on the weight of the dry product)",
        subProductType: 'global',
        productId: 4
      }, {
        name: "2915 70 Palmitic acid, stearic acid, their salts and esters",
        subProductType: 'global',
        productId: 4
      }, {
        name: "2915 90 Saturated acyclic monocarboxylic acids, their anhydrides, halides, peroxides and peroxyacids; their halogenated, sulphonated, nitrated or nitrosated derivatives (excluding formic acid, acetic acid, mono-, di- or trichloroacetic acids, propionic acid, butanoic acids, pentanoic acids, palmitic acid, stearic acid, their salts and esters, and acetic anhydride)",
        subProductType: 'global',
        productId: 4
      }, {
        name: "3823 11 Stearic acid, industrial",
        subProductType: 'global',
        productId: 4
      }, {
        name: "3823 12 Oleic acid, industrial",
        subProductType: 'global',
        productId: 4
      }, {
        name: "3823 19 Industrial monocarboxylic fatty acids; acid oils from refining (excluding stearic acid, oleic acid and tall oil fatty acids)",
        subProductType: 'global',
        productId: 4
      }, {
        name: "3823 70 Industrial fatty alcohols",
        subProductType: 'global',
        productId: 4
      }, {
        name: "4001 Natural rubber, balata, gutta-percha, guayule, chicle and similar natural gums, in primary forms or in plates, sheets or strip",
        subProductType: 'global',
        productId: 5
      }, {
        name: "ex 4005 Compounded rubber, unvulcanised, in primary forms or in plates, sheets or strip",
        subProductType: 'global',
        productId: 5
      }, {
        name: "ex 4006 Unvulcanised rubber in other forms (e.g. rods, tubes and profile shapes) and articles (e.g. discs and rings)",
        subProductType: 'global',
        productId: 5
      }, {
        name: "ex 4007 Vulcanised rubber thread and cord",
        subProductType: 'global',
        productId: 5
      }, {
        name: "ex 4008 Plates, sheets, strips, rods and profile shapes, of vulcanised rubber other than hard rubber",
        subProductType: 'global',
        productId: 5
      }, {
        name: "ex 4010 Conveyer or transmission belts or belting, of vulcanised rubber",
        subProductType: 'global',
        productId: 5
      }, {
        name: "ex 4011 New pneumatic tyres, of rubber",
        subProductType: 'global',
        productId: 5
      }, {
        name: "ex 4012 Retreaded or used pneumatic tyres of rubber; solid or cushion tyres, tyre treads and tyre flaps, of rubber",
        subProductType: 'global',
        productId: 5
      }, {
        name: "ex 4013 Inner tubes, of rubber",
        subProductType: 'global',
        productId: 5
      }, {
        name: "ex 4015 Articles of apparel and clothing accessories (including gloves, mittens and mitts), for all purposes, of vulcanised rubber other than hard rubber",
        subProductType: 'global',
        productId: 5
      }, {
        name: "ex 4016 Other articles of vulcanised rubber other than hard rubber, not elsewhere specified in chapter 40",
        subProductType: 'global',
        productId: 5
      }, {
        name: "ex 4017 Hard rubber (e.g. ebonite) in all forms including waste and scrap; articles of hard rubber",
        subProductType: 'global',
        productId: 5
      }, {
        name: "1201 Soya beans, whether or not broken",
        subProductType: 'global',
        productId: 6
      }, {
        name: "1208 10 Soya bean flour and meal",
        subProductType: 'global',
        productId: 6
      }, {
        name: "1507 Soya-bean oil and its fractions, whether or not refined, but not chemically modified",
        subProductType: 'global',
        productId: 6
      }, {
        name: "2304 Oilcake and other solid residues, whether or not ground or in the form of pellets, resulting from the extraction of soya-bean oil",
        subProductType: 'global',
        productId: 6
      }, {
        name: "4401 Fuel wood, in logs, in billets, in twigs, in faggots or in similar forms; wood in chips or particles; sawdust and wood waste and scrap, whether or not agglomerated in logs, briquettes, pellets or similar forms",
        subProductType: 'global',
        productId: 7
      }, {
        name: "4402 Wood charcoal (including shell or nut charcoal), whether or not agglomerated",
        subProductType: 'global',
        productId: 7
      }, {
        name: "4403 Wood in the rough, whether or not stripped of bark or sapwood, or roughly squared",
        subProductType: 'global',
        productId: 7
      }, {
        name: "4404 Hoopwood; split poles; piles, pickets and stakes of wood, pointed but not sawn lengthwise; wooden sticks, roughly trimmed but not turned, bent or otherwise worked, suitable for the manufacture of walking sticks, umbrellas, tool handles or the like; chipwood and the like",
        subProductType: 'global',
        productId: 7
      }, {
        name: "4405 Wood wool; wood flour",
        subProductType: 'global',
        productId: 7
      }, {
        name: "4406 Railway or tramway sleepers (cross-ties) of wood",
        subProductType: 'global',
        productId: 7
      }, {
        name: "4407 Wood sawn or chipped lengthwise, sliced or peeled, whether or not planed, sanded or end-jointed, of a thickness exceeding 6 mm",
        subProductType: 'global',
        productId: 7
      }, {
        name: "4408 Sheets for veneering (including those obtained by slicing laminated wood), for plywood or for other similar laminated wood and other wood, sawn lengthwise, sliced or peeled, whether or not planed, sanded, spliced or end-jointed, of a thickness not exceeding 6 mm",
        subProductType: 'global',
        productId: 7
      }, {
        name: "4409 Wood (including strips and friezes for parquet flooring, not assembled) continuously shaped (tongued, grooved, rebated, chamfered, V-jointed, beaded, moulded, rounded or the like) along any of its edges, ends or faces, whether or not planed, sanded or end-jointed",
        subProductType: 'global',
        productId: 7
      }, {
        name: "4410 Particle board, oriented strand board (OSB) and similar board (for example, waferboard) of wood or other ligneous materials, whether or not agglomerated with resins or other organic binding substances",
        subProductType: 'global',
        productId: 7
      }, {
        name: "4411 Fibreboard of wood or other ligneous materials, whether or not bonded with resins or other organic substances",
        subProductType: 'global',
        productId: 7
      }, {
        name: "4412 Plywood, veneered panels and similar laminated wood",
        subProductType: 'global',
        productId: 7
      }, {
        name: "4413 Densified wood, in blocks, plates, strips or profile shapes",
        subProductType: 'global',
        productId: 7
      }, {
        name: "4414 Wooden frames for paintings, photographs, mirrors or similar objects",
        subProductType: 'global',
        productId: 7
      }, {
        name: "4415 Packing cases, boxes, crates, drums and similar packings, of wood; cable-drums of wood; pallets, box pallets and other load boards, of wood;",
        subProductType: 'global',
        productId: 7
      }, {
        name: "pallet collars of wood(not including packing material used exclusively as packing material to support, protect or carry another product placed on the market)",
        subProductType: 'global',
        productId: 7
      }, {
        name: "4416 Casks, barrels, vats, tubs and other coopers’ products and parts thereof, of wood, including staves",
        subProductType: 'global',
        productId: 7
      }, {
        name: "4417 Tools, tool bodies, tool handles, broom or brush bodies and handles, of wood; boot or shoe lasts and trees, of wood",
        subProductType: 'global',
        productId: 7
      }, {
        name: "4418 Builders’ joinery and carpentry of wood, including cellular wood panels, assembled flooring panels, shingles and shakes",
        subProductType: 'global',
        productId: 7
      }, {
        name: "4419 Tableware and kitchenware, of wood",
        subProductType: 'global',
        productId: 7
      }, {
        name: "4420 Wood marquetry and inlaid wood; caskets and cases for jewellery or cutlery, and similar articles, of wood; statuettes and other ornaments, of wood; wooden articles of furniture not falling in Chapter 94",
        subProductType: 'global',
        productId: 7
      }, {
        name: "4421 Other articles of wood",
        subProductType: 'global',
        productId: 7
      }, {
        name: "Pulp and paper of Chapters 47 and 48 of the Combined Nomenclature, with the exception of bamboo-based and recovered (waste and scrap) products",
        subProductType: 'global',
        productId: 7
      }, {
        name: "ex 49 Printed books, newspapers, pictures and other products of the printing industry, manuscripts, typescripts and plans, of paper",
        subProductType: 'global',
        productId: 7
      }, {
        name: "ex 9401 Seats (other than those of heading 9402 ), whether or not convertible into beds, and parts thereof, of wood",
        subProductType: 'global',
        productId: 7
      }, {
        name: "9403 30 , 9403 40 , 9403 50 , 9403 60 and 9403 91 Wooden furniture, and parts thereof",
        subProductType: 'global',
        productId: 7
      }, {
        name: "9406 10 Prefabricated buildings of wood",
        subProductType: 'global',
        productId: 7
      },
    ];

    try {
      // Insert new data into the tables
      await queryInterface.bulkInsert('manage_products', products, {});
      await queryInterface.bulkInsert('manage_subproducts', subProducts, {});
    } catch (error) {
      console.log(error)
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('sub_products', null, {});
  }
};
