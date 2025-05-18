const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

// Fonction pour transformer les données
const transformProduct = (product) => ({
    ...product,
    imageUrl: product.imageurl,
    imageurl: undefined
});

// GET tous les produits
router.get('/', async (req, res) => {
    try {
        const result = await getPool().query('SELECT * FROM products');
        const products = result.rows.map(transformProduct);
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// GET un produit par son ID
router.get('/:id', async (req, res) => {
    try {
        const result = await getPool().query('SELECT * FROM products WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }
        res.json(transformProduct(result.rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// POST créer un nouveau produit
router.post('/', async (req, res) => {
    try {
        const { name, price, imageUrl, description } = req.body;
        const result = await getPool().query(
            'INSERT INTO products (name, price, imageurl, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, price, imageUrl, description]
        );
        res.status(201).json(transformProduct(result.rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// PUT mettre à jour un produit
router.put('/:id', async (req, res) => {
    try {
        const { name, price, imageUrl, description } = req.body;
        const result = await getPool().query(
            'UPDATE products SET name = COALESCE($1, name), price = COALESCE($2, price), imageurl = COALESCE($3, imageurl), description = COALESCE($4, description) WHERE id = $5 RETURNING *',
            [name, price, imageUrl, description, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }
        res.json(transformProduct(result.rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// DELETE supprimer un produit
router.delete('/:id', async (req, res) => {
    try {
        const result = await getPool().query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }
        res.json(transformProduct(result.rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router; 