const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

let dbType = 'sqlite';
let sqliteDb = null;
let pgPool = null;

const dbPath = path.join(__dirname, 'database.sqlite');
const connectionString = process.env.DATABASE_URL;

if (connectionString) {
  console.log('🔌 DATABASE_URL found. Initializing PostgreSQL pool...');
  pgPool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Render Postgres
  });
  dbType = 'postgres';
} else {
  console.log(`🔌 No DATABASE_URL found. Initializing SQLite local database at ${dbPath}...`);
  sqliteDb = new sqlite3.Database(dbPath);
  dbType = 'sqlite';
}

// Helper to execute raw queries
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (dbType === 'postgres') {
      // Postgres parameters are $1, $2, etc. If the query was written for SQLite (?, ?, etc.),
      // we need to translate ? to $1, $2 etc.
      let pgSql = sql;
      let index = 1;
      while (pgSql.includes('?')) {
        pgSql = pgSql.replace('?', `$${index++}`);
      }
      pgPool.query(pgSql, params, (err, res) => {
        if (err) return reject(err);
        resolve(res.rows);
      });
    } else {
      sqliteDb.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    }
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (dbType === 'postgres') {
      let pgSql = sql;
      let index = 1;
      while (pgSql.includes('?')) {
        pgSql = pgSql.replace('?', `$${index++}`);
      }
      pgPool.query(pgSql, params, (err, res) => {
        if (err) return reject(err);
        resolve({ lastID: null, changes: res.rowCount });
      });
    } else {
      sqliteDb.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    }
  });
}

// Set up table schemas
async function initDb() {
  const isPostgres = dbType === 'postgres';
  
  const textType = isPostgres ? 'TEXT' : 'TEXT';
  const serialType = isPostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
  
  // Create tables
  await run(`
    CREATE TABLE IF NOT EXISTS outfits (
      id ${serialType},
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      image TEXT NOT NULL,
      price TEXT NOT NULL,
      oldPrice TEXT,
      description TEXT,
      colours TEXT,
      sizes TEXT,
      fabric TEXT,
      availability TEXT,
      badge TEXT,
      badgeText TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id ${serialType},
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      submittedAt TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS measurements (
      id ${serialType},
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      shoulder TEXT,
      chest TEXT,
      waist TEXT,
      hips TEXT,
      sleeve TEXT,
      length TEXT,
      height TEXT,
      notes TEXT,
      submittedAt TEXT NOT NULL
    )
  `);

  // Simple Analytics Tables
  await run(`
    CREATE TABLE IF NOT EXISTS analytics_views (
      date TEXT PRIMARY KEY,
      views TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS analytics_outfits (
      outfitId TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      views INTEGER DEFAULT 0
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id ${serialType},
      type TEXT NOT NULL,
      data TEXT,
      timestamp TEXT NOT NULL
    )
  `);

  // Seed default data if outfits table is empty
  const existingOutfits = await query('SELECT COUNT(*) as count FROM outfits');
  if (parseInt(existingOutfits[0].count || existingOutfits[0].COUNT || 0) === 0) {
    console.log('🌱 Seeding database with default outfits...');
    
    const defaultOutfits = [
      {
        id: 1,
        name: 'Elegant Navy Blue Senator Style',
        category: 'men',
        image: 'eyiwunmi_images/beautiful_2piece.jpeg',
        price: '₦75,000',
        oldPrice: '₦90,000',
        description: 'A sharp, tailored navy blue Senator outfit featuring clean lines and a premium finish. Perfect for weddings, church service, or special ceremonies.',
        colours: JSON.stringify(['#1A2A3A', '#D4AF37']),
        sizes: 'M, L, XL, 2XL',
        fabric: 'Premium Cashmere Cotton',
        availability: 'In Stock',
        badge: 'new',
        badgeText: 'New'
      },
      {
        id: 2,
        name: 'Classic Navy Two-Piece Suit',
        category: 'men',
        image: 'eyiwunmi_images/slay_with_style.jpeg',
        price: '₦85,000',
        oldPrice: '₦110,000',
        description: 'A modern, slim-fit navy blue suit crafted from high-quality wool blend. Ideal for formal corporate engagements, business, and formal events.',
        colours: JSON.stringify(['#1B2E4A', '#FFFFFF']),
        sizes: 'S, M, L, XL, 2XL',
        fabric: 'Super 120s Wool Blend',
        availability: 'In Stock',
        badge: 'sale',
        badgeText: 'Sale'
      },
      {
        id: 3,
        name: 'Peach Asoebi Lace Gown',
        category: 'women',
        image: 'eyiwunmi_images/luxury_outing_gown.png',
        price: '₦110,000',
        oldPrice: null,
        description: 'An elegant peach lace native gown designed with intricate patterns and a matching gele. Perfect for brides, mothers of the day, and high-profile guests.',
        colours: JSON.stringify(['#F3A79E', '#EBC3B2']),
        sizes: 'S, M, L, XL',
        fabric: 'French Lace & Silk Lining',
        availability: 'Made to Order',
        badge: null,
        badgeText: null
      },
      {
        id: 4,
        name: 'Kids Royal Agbada Set',
        category: 'kids',
        image: 'eyiwunmi_images/eyiwunmi_closet.jpg',
        price: '₦48,000',
        oldPrice: '₦58,000',
        description: 'A beautiful miniature white and gold traditional agbada for your little prince. Crafted with soft, non-itchy materials for maximum comfort.',
        colours: JSON.stringify(['#FFFFFF', '#D4AF37']),
        sizes: '2-4y, 4-6y, 6-8y, 8-10y',
        fabric: 'Soft Cotton Brocade',
        availability: 'In Stock',
        badge: 'sale',
        badgeText: 'Sale'
      },
      {
        id: 5,
        name: 'Luxury Green & Gold Lace Gown',
        category: 'asoebi',
        image: 'eyiwunmi_images/femae_classic_suit.png',
        price: '₦150,000',
        oldPrice: '₦180,000',
        description: 'An exquisite statement green and gold lace gown with dramatic detailing. Crafted for prestigious celebrations where standing out is a must.',
        colours: JSON.stringify(['#1E4620', '#D4AF37']),
        sizes: 'M, L, XL',
        fabric: 'Premium Cord Lace & Satin',
        availability: 'Made to Order',
        badge: 'new',
        badgeText: 'Luxury'
      },
      {
        id: 6,
        name: 'Charcoal Black Senator Style',
        category: 'men',
        image: 'eyiwunmi_images/nice_dress.jpeg',
        price: '₦70,000',
        oldPrice: null,
        description: 'A clean and minimalist charcoal black Senator wear with subtle chest embroidery. Perfect for corporate-casual events and weekend outings.',
        colours: JSON.stringify(['#1F2937', '#6B7280']),
        sizes: 'M, L, XL, 2XL',
        fabric: 'Polish Cotton',
        availability: 'In Stock',
        badge: null,
        badgeText: null
      },
      {
        id: 7,
        name: 'Beige Embroidered Kaftan',
        category: 'men',
        image: 'eyiwunmi_images/luxury_jumpsuit.jpeg',
        price: '₦78,000',
        oldPrice: '₦95,000',
        description: 'A premium sand-beige kaftan set with intricate tone-on-tone chest embroidery. Breathable and comfortable for all-day wear.',
        colours: JSON.stringify(['#D2B48C', '#E6C280']),
        sizes: 'M, L, XL, 2XL',
        fabric: 'Soft Linen Cotton',
        availability: 'In Stock',
        badge: 'sale',
        badgeText: 'Sale'
      },
      {
        id: 8,
        name: 'Classic Black Tuxedo',
        category: 'men',
        image: 'eyiwunmi_images/luxury_bubu_gown.jpeg',
        price: '₦95,000',
        oldPrice: '₦125,000',
        description: 'A sharp, double-breasted black tuxedo with satin peak lapels. The absolute definition of formal elegance for weddings and black-tie galas.',
        colours: JSON.stringify(['#000000', '#FFFFFF']),
        sizes: 'S, M, L, XL, 2XL',
        fabric: 'Super 150s Merino Wool',
        availability: 'In Stock',
        badge: 'new',
        badgeText: 'New'
      },
      {
        id: 9,
        name: 'Royal Blue Evening Gown',
        category: 'women',
        image: 'eyiwunmi_images/luxury_suit.jpeg',
        price: '₦92,000',
        oldPrice: null,
        description: 'A breathtaking royal blue gown with draped waist detailing and a high slit. Designed to command attention at dinners and red carpets.',
        colours: JSON.stringify(['#0F52BA', '#FFFFFF']),
        sizes: 'S, M, L, XL',
        fabric: 'Stretch Crepe & Silk Satin',
        availability: 'In Stock',
        badge: null,
        badgeText: null
      },
      {
        id: 10,
        name: 'Crimson & Black Patterned Dress',
        category: 'women',
        image: 'eyiwunmi_images/dinner_choice.jpeg',
        price: '₦88,000',
        oldPrice: '₦105,000',
        description: 'A bold, abstract red and black patterned long gown with a modern wrap bodice. Perfect for high-fashion statements and cocktails.',
        colours: JSON.stringify(['#990000', '#000000']),
        sizes: 'S, M, L, XL',
        fabric: 'Premium Brocade Satin',
        availability: 'In Stock',
        badge: 'sale',
        badgeText: 'Sale'
      },
      {
        id: 11,
        name: 'Sunset Yellow Asoebi Gown',
        category: 'women',
        image: 'eyiwunmi_images/beautiful_piece.jpeg',
        price: '₦120,000',
        oldPrice: '₦140,000',
        description: 'A custom sunset yellow lace gown detailed with pink floral applique. A brilliant choice for spring and summer traditional occasions.',
        colours: JSON.stringify(['#FAD02C', '#F472B6']),
        sizes: 'S, M, L, XL',
        fabric: 'Hand-beaded Lace',
        availability: 'Made to Order',
        badge: 'new',
        badgeText: 'Trending'
      },
      {
        id: 12,
        name: 'Golden Gele Asoebi Set',
        category: 'asoebi',
        image: 'eyiwunmi_images/comfortable_bub.jpeg',
        price: '₦125,000',
        oldPrice: null,
        description: 'A complete traditional set featuring a yellow lace gown and premium metallic gold gele. Tailored to absolute perfection.',
        colours: JSON.stringify(['#E6C280', '#D4AF37']),
        sizes: 'M, L, XL, 2XL',
        fabric: 'French Tulle & Organdie',
        availability: 'Made to Order',
        badge: null,
        badgeText: null
      },
      {
        id: 13,
        name: 'Royal Blue Couple Asoebi Set',
        category: 'asoebi',
        image: 'eyiwunmi_images/luxury_materials.png',
        price: '₦195,000',
        oldPrice: '₦230,000',
        description: 'A matching royal blue native wear package for couples. Includes a tailored senator/agbada style and a beautiful custom lady’s gown.',
        colours: JSON.stringify(['#0B3C5D', '#328CC1']),
        sizes: 'Custom Fit',
        fabric: 'Premium Senator Fabric & Cord Lace',
        availability: 'Made to Order',
        badge: 'new',
        badgeText: 'Couple'
      },
      {
        id: 14,
        name: 'Family Matching Pink Set',
        category: 'kids',
        image: 'eyiwunmi_images/Plain_blackdress.jpg',
        price: '₦160,000',
        oldPrice: '₦190,000',
        description: 'A coordinated set for parents and children in soft baby pink and purple patterns. An incredible look for dedication and birthday events.',
        colours: JSON.stringify(['#FFC0CB', '#4A2B5F']),
        sizes: 'Custom Size Pack',
        fabric: 'Polished Cotton & Brocade',
        availability: 'Made to Order',
        badge: 'sale',
        badgeText: 'Family'
      },
      {
        id: 15,
        name: 'Grey Tailored Executive Suit',
        category: 'men',
        image: 'eyiwunmi_images/dinner_set.jpeg',
        price: '₦80,000',
        oldPrice: null,
        description: 'A sharp and classic medium-grey suit with a structured shoulder line. A versatile wardrobe staple for executive business meetings.',
        colours: JSON.stringify(['#808080', '#FFFFFF']),
        sizes: 'S, M, L, XL, 2XL',
        fabric: 'Italian Wool & Viscose',
        availability: 'In Stock',
        badge: null,
        badgeText: null
      },
      {
        id: 16,
        name: 'Burgundy Smart Suit',
        category: 'men',
        image: 'eyiwunmi_images/perfect_2piece.jpeg',
        price: '₦88,000',
        oldPrice: '₦100,000',
        description: 'A rich burgundy smart suit styled with modern slim lapels. Perfect for evening networking, graduation, and dinner dates.',
        colours: JSON.stringify(['#800020', '#1F2937']),
        sizes: 'M, L, XL, 2XL',
        fabric: 'Stretch Rayon Blend',
        availability: 'In Stock',
        badge: 'new',
        badgeText: 'Hot'
      }
    ];

    for (const item of defaultOutfits) {
      if (isPostgres) {
        await run(
          `INSERT INTO outfits (name, category, image, price, oldPrice, description, colours, sizes, fabric, availability, badge, badgeText)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [item.name, item.category, item.image, item.price, item.oldPrice, item.description, item.colours, item.sizes, item.fabric, item.availability, item.badge, item.badgeText]
        );
      } else {
        await run(
          `INSERT INTO outfits (id, name, category, image, price, oldPrice, description, colours, sizes, fabric, availability, badge, badgeText)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [item.id, item.name, item.category, item.image, item.price, item.oldPrice, item.description, item.colours, item.sizes, item.fabric, item.availability, item.badge, item.badgeText]
        );
      }
    }
    console.log('✅ Seeding complete.');
  }
}

module.exports = {
  dbType,
  query,
  run,
  initDb
};
