const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Dummy URLs for e-commerce APIs
const ECOMMERCE_API_URLS = {
  'AMZ': 'http://20.244.56.144/test/companies/AMZ/categories',
  'FLP': 'http://20.244.56.144/test/companies/FLP/categories',
  'SNP': 'http://20.244.56.144/test/companies/SNP/categories',
  'MYN': 'http://20.244.56.144/test/companies/MYN/categories',
  'AZO': 'http://20.244.56.144/test/companies/AZO/categories',
};

// fetch products from all e-commerce APIs
const fetchProductsFromAllAPIs = async (category, query) => {
    const fetchPromises = Object.keys(ECOMMERCE_API_URLS).map(async (key) => {
      try {
        const response = await axios.get(`${ECOMMERCE_API_URLS[key]}/${category}/products`, {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE3MjIzMjA5LCJpYXQiOjE3MTcyMjI5MDksImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImExYWFiNzdkLTcxZjUtNDZkMy1iODBiLTIyNzFkYTMwYWM0ZCIsInN1YiI6IjIxY3MzMDI1QHJnaXB0LmFjLmluIn0sImNvbXBhbnlOYW1lIjoiZ29NYXJ0IiwiY2xpZW50SUQiOiJhMWFhYjc3ZC03MWY1LTQ2ZDMtYjgwYi0yMjcxZGEzMGFjNGQiLCJjbGllbnRTZWNyZXQiOiJQR2llUGxaY1J5ZWxZa1BWIiwib3duZXJOYW1lIjoiSmFpbWluIiwib3duZXJFbWFpbCI6IjIxY3MzMDI1QHJnaXB0LmFjLmluIiwicm9sbE5vIjoiMjFDUzMwMjUifQ.E8741OtSsi2IgvlGAp-WIyMc991YScdqaHrq61-EGc4`,
          },
          params: {
            top: query.top,
            minPrice: query.minPrice,
            maxPrice: query.maxPrice,
          },
        });
        return response.data;
      } catch (error) {
        console.error(`Failed to fetch products from ${key}: ${error.message}`);
        return [];
      }
    });
  
    const results = await Promise.all(fetchPromises);
    return results.flat();
  };
  
  // function to sort and paginate products
  const sortAndPaginateProducts = (products, n, page, sortKey, sortOrder) => {
    if (sortKey) {
      products.sort((a, b) => (a[sortKey] > b[sortKey] ? 1 : -1) * (sortOrder === 'desc' ? -1 : 1));
    }
    const start = (page - 1) * n;
    const end = start + n;
    return products.slice(start, end);
  };
  
// get products within a category
app.get('/categories/:categoryname/products', async (req, res) => {
    try {
      const { categoryname } = req.params;
      const { top = 10, minPrice = 1, maxPrice = 10000 } = req.query;
  
      const products = await fetchProductsFromAllAPIs(categoryname, { top, minPrice, maxPrice });
      const productsWithIds = products.map(product => ({
        ...product,
        id: uuidv4()
      }));
  
      const paginatedProducts = sortAndPaginateProducts(productsWithIds, parseInt(top), 1, null, 'asc');
      res.json(paginatedProducts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });
  

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
