import React, { useState, useEffect } from "react";
import "./ProductsPage.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaFilter, FaTrash, FaEdit } from "react-icons/fa";
import { Button, Table, Form, InputGroup, Pagination } from "react-bootstrap";

const ProductsPage = ({ existingProductData }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [skuCounts, setSkuCounts] = useState({});

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    categoryId: "",
    price: "",
    sku: "",
    color: "",
    material: "",
    description: "",
    length: "",
    width: "",
    details: "",
    stock: "",
    images: [null, null, null, null, null],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  
  useEffect(() => {
    setFilteredProducts(products); 
  }, [products]); 
  
  const handleSearch = (query) => {
    setSearchTerm(query);
    setCurrentPage(1); 
  };
  
  
  const filteredData = searchTerm
  ? products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : products;


const totalPages = Math.ceil(filteredData.length / itemsPerPage);


const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentProducts = filteredData.slice(indexOfFirstItem, indexOfLastItem);



  const fetchProducts = async () => {
    try {
      const response = await axios.get("https://api.atoutfashion.com/api/products");
      const productsData = response.data.data || [];
      
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);



  const [imagePreviews, setImagePreviews] = useState([
    null,
    null,
    null,
    null,
    null,
  ]);
  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const updatedPreviews = [...imagePreviews];
      updatedPreviews[index] = URL.createObjectURL(file); 
      setImagePreviews(updatedPreviews);
  
      const updatedImages = [...newProduct.images];
      updatedImages[index] = file; 
      setNewProduct({ ...newProduct, images: updatedImages });
    }
  };
  

  const checkIfSKUExists = async (sku) => {
    try {
      const response = await axios.get(`https://api.atoutfashion.com/api/products/check-sku?sku=${sku}`);
      return response.data.exists; 
    } catch (error) {
      console.error("Error checking SKU:", error);
      return false;
    }
  };
  
  const handleAddProduct = async () => {
    if (!newProduct.sku) {
      alert("Please enter a SKU or let the system generate one.");
      return;
    }
  
    const skuExists = await checkIfSKUExists(newProduct.sku);
    if (skuExists) {
      alert(`A product with SKU '${newProduct.sku}' already exists. Please use a different SKU.`);
      return;
    }
  
    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("category", newProduct.category);
    formData.append("category_id", newProduct.categoryId);
    formData.append("price", newProduct.price);
    formData.append("sku", newProduct.sku);
    formData.append("material", newProduct.material);
    formData.append("color", newProduct.color);
    formData.append("description", newProduct.description);
    formData.append("length", newProduct.length);
    formData.append("width", newProduct.width);
    formData.append("details", newProduct.details);
    formData.append("stock", newProduct.stock);
  
    newProduct.images.forEach((image) => {
      if (image instanceof File) {
        formData.append("images", image);
      }
    });
  
    try {
      const response = await axios.post("https://api.atoutfashion.com/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      console.log("Product added:", response.data);
      
     
      window.location.reload();
  
    } catch (error) {
      console.error("Error adding product:", error.response?.data || error);
    }
  };
  
  

  const handleUpdateProduct = async () => {
    try {
      if (!newProduct._id) {
        console.error("No product ID found for update.");
        return;
      }

      console.log("Updating product with ID:", newProduct._id); 

    
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("category", newProduct.category);
      formData.append("price", newProduct.price);
      formData.append("sku", newProduct.sku);
      formData.append("material", newProduct.material);
      formData.append("color", newProduct.color);
      formData.append("description", newProduct.description);
      formData.append("length", newProduct.length);
      formData.append("width", newProduct.width);
      formData.append("details", newProduct.details);
      formData.append("stock", newProduct.stock);

   
      if (newProduct.images && newProduct.images.length > 0) {
        newProduct.images.forEach((file) => {
          formData.append("images", file); 
        });
      }

      const response = await axios.put(
        `https://api.atoutfashion.com/api/products/${newProduct._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }, 
        }
      );

      if (response.data.success) {
        alert("Product updated successfully!");
        setIsAddingProduct(false); 
        setIsEditingProduct(false); 
        fetchProducts(); 
      } else {
        alert(response.data.message || "Failed to update product.");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product.");
    }
  };

  const handleEditProduct = (productId) => {
    const productToEdit = products.find((product) => product._id === productId);
  

    const updatedImagePreviews = productToEdit.images.map((image) =>
      typeof image === "string" ? image : null
    );

    setNewProduct({
      ...productToEdit,
      category: productToEdit.category || "",
    });
  
    setNewProduct(productToEdit);
    setImagePreviews(updatedImagePreviews); 
    setIsAddingProduct(true);
    setIsEditingProduct(true);
  };
  
  

  const handleDeleteProduct = async (productId) => {
    try {
      console.log("Delete product with id:", productId); 

      const response = await axios.delete(
        `https://api.atoutfashion.com/api/products/${productId}`
      );

      if (response.data.success) {
        alert("Product deleted successfully!");
       
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product._id !== productId)
        );
      } else {
        alert("Failed to delete product.");
      }
    } catch (error) {
      console.error("Error deleting product:", error.message);
      alert("An error occurred while deleting the product.");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("https://api.atoutfashion.com/api/categories");
      console.log("API Response Inside fetchCategories:", response.data); 
      setCategories(response.data || []); 
      console.log("Categories After setCategories:", response.data); 
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryChange = (selectedCategory) => {
    const findCategory = categories.find(
      (category) => category.category === selectedCategory
    );
    console.log("findCategory", findCategory);

    
    const currentCount = skuCounts[selectedCategory] || 0;
    const newSku = `${selectedCategory.slice(0, 3).toUpperCase()}${String(
      currentCount + 1
    ).padStart(3, "0")}`;

    
    setSkuCounts({
      ...skuCounts,
      [selectedCategory]: currentCount + 1,
    });

    // Update product state
    // setNewProduct({
    //   ...newProduct,
    //   category: findCategory.category,
    //   sku: newSku,
    //   categoryId: findCategory._id,
    // });

    if (findCategory) {
      setNewProduct({
        ...newProduct,
        category: findCategory.category, 
        sku: newSku,
        categoryId: findCategory._id, 
      });
    }
  };





  const handleRowClick = (product) => {
    setSelectedProduct(product);
  };
  

  const handleBackToTable = () => {
    setSelectedProduct(null);
  };

  return (
    <div
      className="container my-4"
      style={{ maxWidth: "120%", marginLeft: "10%" }}
    >
      <div className="row">
        {/* Left Column - Products */}
        <div className="col-md-8 mx-auto" style={{ width: "80%" }}>
          <h3
            className="mb-4 text-center"
            style={{ color: "#333", fontWeight: "bold" }}
          ></h3>

          {isAddingProduct ? (
            <div
              style={{
                padding: "15px",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <button
                  variant="secondary"
                  onClick={() => setIsAddingProduct(false)}
                  style={{
                    padding: "10px",
                    backgroundColor: "transparent",
                    color: "#333",
                    border: "none",
                    borderRadius: "50%",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label="Back"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
                  </svg>
                </button>
                <h2
                  style={{
                    textAlign: "left",
                    color: "#333",
                    flexGrow: 1,
                    margin: 0,
                  }}
                >
                  {isEditingProduct ? "Edit Product" : "Add Product"}
                </h2>
              </div>

              <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
  {[0, 1, 2, 3, 4].map((index) => (
    <div
      key={index}
      style={{
        width: "200px",
        height: "265px",
        border: "2px dashed #ccc",
      }}
    >
      <label htmlFor={`image${index}`}>
        {imagePreviews[index] ? (
          <img
            src={imagePreviews[index]} // ✅ Works for both URLs & new previews
            alt="Preview"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          "+ Add Image"
        )}
      </label>
      <input
        id={`image${index}`}
        type="file"
        onChange={(e) => handleImageChange(e, index)}
        accept="image/*"
        style={{ display: "none" }}
      />
    </div>
  ))}
</div>



              <div
                style={{ display: "flex", gap: "15px", marginBottom: "20px" }}
              >
                {/* Product Name */}
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    style={{
                      width: "93%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                </div>

                {/* Category */}
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Category
                  </label>

                  <select
  style={{
    width: "100%",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  }}
  value={newProduct.category || ""} // ✅ Ensure category is correctly set
  onChange={(e) => handleCategoryChange(e.target.value)}
>
  <option value="">-- Select Category --</option>
  {categories.length > 0 ? (
    categories.map((category) => (
      <option key={category._id} value={category.category}>
        {category.category}
      </option>
    ))
  ) : (
    <option disabled>Loading categories...</option>
  )}
</select>

                </div>

                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Color
                  </label>
                  <input
                    type="text"
                    value={newProduct.color}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, color: e.target.value })
                    }
                    style={{
                      width: "93%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Stock
                  </label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, stock: e.target.value })
                    }
                    style={{
                      width: "93%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              </div>
              <div
                style={{ display: "flex", gap: "20px", marginBottom: "20px" }}
              >
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Length
                  </label>
                  <input
                    type="text"
                    value={newProduct.length}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, length: e.target.value })
                    }
                    style={{
                      width: "70%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                </div>

                <div style={{ flex: 1, marginLeft: "-8%" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Width
                  </label>
                  <input
                    type="text"
                    value={newProduct.width}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, width: e.target.value })
                    }
                    style={{
                      width: "70%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <div style={{ flex: 1, marginLeft: "-8%" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Price
                  </label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    style={{
                      width: "70%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <div style={{ flex: 1, marginLeft: "-8%" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    SKU
                  </label>
                  <input
                    type="text"
                    value={newProduct.sku} // SKU is auto-updated
                    onChange={
                      (e) =>
                        setNewProduct({ ...newProduct, sku: e.target.value }) // Allows manual override
                    }
                    style={{
                      width: "70%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              </div>
              <div
                style={{ display: "flex", gap: "20px", marginBottom: "20px" }}
              >
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Material
                  </label>
                  <input
                    type="text"
                    value={newProduct.material || ""}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, material: e.target.value })
                    }
                    style={{
                      width: "93%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                    }
                    style={{
                      width: "90%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Details
                  </label>
                  <input
                    type="text"
                    value={newProduct.details}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, details: e.target.value })
                    }
                    style={{
                      width: "90%",
                      height: "60%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <button
                  onClick={
                    isEditingProduct ? handleUpdateProduct : handleAddProduct
                  }
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#593E3E",
                    color: "#fff",
                    marginLeft: "auto",
                    border: "none",
                    // marginTop:'80%',
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {isEditingProduct ? "Update Product" : "Add Product"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "-3%",
                  position:'relative'
                }}
              >
                <div style={{ position: "relative" }}>
                <input
  type="text"
  placeholder="Search "
  style={{ padding: "5px 10px 5px 30px", width: "250px" }}
  value={searchTerm}
  onChange={(e) => handleSearch(e.target.value)}
/>

                  <i
                    className="fa fa-search"
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  ></i>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <button
                    onClick={() => setIsAddingProduct(true)}
                    style={{ padding: "5px 10px", cursor: "pointer",  }}
                  >
                    + Add Product
                  </button>
                </div>
              </div>

              <div>
                {/* Show Table if no product is selected */}
                {!selectedProduct && (
                 <>
                 <Table striped bordered hover responsive className="product-table shadow-sm">
                   <thead style={{ textAlign: "center" }}>
                     <tr>
                       <th>Sl.no</th>
                       <th>Product Name</th>
                       <th>Category</th>
                       <th>Price</th>
                       <th>SKU</th>
                       <th>Created Date</th>
                       <th>Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {currentProducts .map((product, index) => (
                       <tr key={product._id} style={{ cursor: "pointer" }}>
                         <td>{indexOfFirstItem + index + 1}</td>
                         <td onClick={() => handleRowClick(product)}>{product.name}</td>
                         <td onClick={() => handleRowClick(product)}>{product.category}</td>
                         <td onClick={() => handleRowClick(product)}>{product.price}</td>
                         <td onClick={() => handleRowClick(product)}>{product.sku}</td>
                         <td onClick={() => handleRowClick(product)}>
                           {product.formattedCreatedDate}
                         </td>
                         <td>
                           <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                             <FaEdit
                               style={{ cursor: "pointer", marginRight: "5px" }}
                               onClick={() => handleEditProduct(product._id)}
                             />
                             <FaTrash
                               style={{ cursor: "pointer", color: "red" }}
                               onClick={() => handleDeleteProduct(product._id)}
                             />
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </Table>
           
                 {/* Pagination Controls */}
                 <Pagination className="justify-content-center">
  <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
  <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />

  {Array.from({ length: totalPages }, (_, i) => (
    <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
      {i + 1}
    </Pagination.Item>
  ))}

  <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />
  <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
</Pagination>

               </>
                )}

                {/* Show Details if a product is selected */}
                {selectedProduct && (
                  <div>
                    <button
                      variant="secondary"
                      onClick={handleBackToTable}
                      style={{
                        padding: "10px",
                        backgroundColor: "transparent",
                        color: "#333",
                        border: "none",
                        borderRadius: "50%",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      aria-label="Back"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
                      </svg>
                    </button>
                    <div
                      style={{
                        padding: "20px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        maxWidth: "900px",
                        margin: "0 auto",
                      }}
                    >
                      {/* Image Gallery */}
                      <div
                        style={{
                          display: "flex",
                          gap: "15px",
                          marginBottom: "20px",
                        }}
                      >
                        {selectedProduct.images &&
                          selectedProduct.images.map((image, index) => {
                            console.log("Image URL:", image); // Log image URL to verify
                            return (
                              <div
                                key={index}
                                style={{
                                  width: "120px",
                                  height: "120px",
                                  border: "1px solid #ccc",
                                  borderRadius: "8px",
                                  overflow: "hidden",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  backgroundColor: "#f9f9f9",
                                }}
                              >
                                <img
                                  src={image}
                                  alt={`Product ${index}`}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                />
                              </div>
                            );
                          })}

                        <div
                          style={{
                            width: "120px",
                            height: "120px",
                            border: "1px dashed #ccc",
                            borderRadius: "8px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            cursor: "pointer",
                          }}
                        >
                          <span style={{ fontSize: "24px", color: "#aaa" }}>
                            + Add images
                          </span>
                        </div>
                      </div>

                      {/* Category, Sub-category, and Attributes */}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "15px",
                          marginBottom: "20px",
                        }}
                      >
                        <div
                          style={{
                            padding: "10px 20px",
                            border: "1px solid #ddd",
                            borderRadius: "20px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <strong>Category:</strong> {selectedProduct.category}
                        </div>
                        {/* <div
                          style={{
                            padding: "10px 20px",
                            border: "1px solid #ddd",
                            borderRadius: "20px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <strong>Sub-category:</strong>{" "}
                          {selectedProduct.subCategory} */}
                        {/* </div> */}
                        <div
                          style={{
                            padding: "10px 20px",
                            border: "1px solid #ddd",
                            borderRadius: "20px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <strong>Length:</strong> {selectedProduct.length}
                        </div>
                        <div
                          style={{
                            padding: "10px 20px",
                            border: "1px solid #ddd",
                            borderRadius: "20px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <strong>Width:</strong> {selectedProduct.width}
                        </div>
                        <div
                          style={{
                            padding: "10px 20px",
                            border: "1px solid #ddd",
                            borderRadius: "20px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <strong>SKU:</strong> {selectedProduct.sku}
                        </div>
                        <div
                          style={{
                            padding: "10px 20px",
                            border: "1px solid #ddd",
                            borderRadius: "20px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <strong>Color:</strong> {selectedProduct.color}
                        </div>
                        <div
                          style={{
                            padding: "10px 20px",
                            border: "1px solid #ddd",
                            borderRadius: "20px",
                            backgroundColor: "#f9f9f9",
                          }}
                        >
                          <strong>Material:</strong> {selectedProduct.material}
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h3>Description</h3>
                        <p style={{ lineHeight: "1.6", color: "#555" }}>
                          {selectedProduct.description}
                        </p>
                      </div>
                      <div>
                        <h3>Details</h3>
                        <p style={{ lineHeight: "1.6", color: "#555" }}>
                          {selectedProduct.details}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
