const { Pool } = require('pg');
require('dotenv').config();

// Configuration de base
const dbConfig = {
    user: 'postgres',
    host: 'localhost',
    password: 'password',
    port: 5432,
};

// Pool temporaire pour l'initialisation
const initPool = new Pool({
    ...dbConfig,
    database: 'postgres'
});

// Pool pour la base de données principale
let pool;

// Exécuter l'initialisation au démarrage
async function initDatabase() {
    try {
        // Vérifier si la base de données existe
        const result = await initPool.query(
            "SELECT 1 FROM pg_database WHERE datname = 'products_db'"
        );

        // Si la base n'existe pas, la créer
        if (result.rows.length === 0) {
            await initPool.query('CREATE DATABASE products_db');
            console.log('Base de données créée avec succès');

            // Créer un nouveau pool pour la nouvelle base
            const productsPool = new Pool({
                ...dbConfig,
                database: 'products_db'
            });

            // Créer la table products
            await productsPool.query(`
                CREATE TABLE products (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    price DECIMAL(10,2) NOT NULL,
                    imageurl VARCHAR(255),
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Insérer les données de test
            await productsPool.query(`
                INSERT INTO products (name, price, imageurl, description) VALUES
                ('Magic Book', 100.00, 'ordietpomme.jpg', 'Description du produit 1'),
                ('Headphone', 200.00, 'headphone.webp', 'Description du produit 2')
            `);
            
            console.log('Tables créées avec succès');
            pool = productsPool;
        } else {
            // Si la base existe, se connecter simplement
            pool = new Pool({
                ...dbConfig,
                database: 'products_db'
            });
        }
        
        console.log('Connecté à la base de données products_db');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        process.exit(1);
    } finally {
        await initPool.end();
    }
}

// Lancer l'initialisation
initDatabase();

module.exports = {
    getPool: () => pool
}; 