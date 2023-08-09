import React, { useState, useEffect } from "react";
import "./ProductRevenueTable.css";

function formatNumber(number) {
  return number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
}

async function fetchData() {
  try {
    const branch1Response = await fetch(
      "https://api.npoint.io/ddc8e13407dee87b4fbf"
    );
    const branch1Data = await branch1Response.json();

    const branch2Response = await fetch(
      "https://api.npoint.io/064f55a22086a7cdd848"
    );
    const branch2Data = await branch2Response.json();
    console.log(branch2Data);

    const branch3Response = await fetch(
      "https://api.npoint.io/0b50cfe84b3833da8dc0"
    );
    const branch3Data = await branch3Response.json();
    console.log(branch3Data);

    const allProducts = [
      ...branch1Data.products,
      ...branch2Data.products,
      ...branch3Data.products,
    ];

    const mergedProducts = allProducts.reduce((acc, product) => {
      const existingProduct = acc.find((p) => p.name === product.name);
      if (existingProduct) {
        existingProduct.revenue += product.unitPrice * product.sold;
      } else {
        acc.push({
          name: product.name,
          revenue: product.unitPrice * product.sold,
        });
      }
      return acc;
    }, []);
    mergedProducts.sort((a, b) => {
      const charA = a.name.toUpperCase();
      const charB = b.name.toUpperCase();

      if (charA < charB) {
        return -1;
      } else if (charA > charB) {
        return 1;
      } else {
        return 0;
      }
    });
    return mergedProducts;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
}

function ProductRevenueTable() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchData().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().startsWith(searchTerm.toLowerCase())
    );

    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  useEffect(() => {
    // Calculate total revenue for the filtered products
    const revenue = filteredProducts.reduce(
      (acc, product) => acc + product.revenue,
      0
    );
    setTotalRevenue(revenue);
  }, [filteredProducts]);

  return (
    <div>
      <div className="header">
        <label htmlFor="search">Filter by Product Name:</label>
        <input
          type="search"
          id="search"
          placeholder="Search for product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {loading && <h1>Loading...</h1>}
      <table>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Total Revenue</th>
          </tr>
        </thead>

        {!loading && (
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.name}>
                <td>{product.name}</td>
                <td>{formatNumber(product.revenue)}</td>
              </tr>
            ))}
          </tbody>
        )}
        <tfoot>
          <tr className="total">
            <td>
              <b>Total Revenue: {formatNumber(totalRevenue)}</b>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default ProductRevenueTable;
