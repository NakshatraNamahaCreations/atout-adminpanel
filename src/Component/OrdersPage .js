import React, { useState, useEffect } from "react";
import { Table, Button, Card, Form, Row, Col, Pagination, InputGroup } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
// Import Order model if needed
// import Order from "../models/ordermodel"; // Uncomment and adjust path if Order is a model

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatedProducts, setUpdatedProducts] = useState([]);
  const [isModified, setIsModified] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Calculate total pages
  // const totalPages = Math.ceil(orders.length / itemsPerPage);

  // Get current page data
  // const indexOfLastItem = currentPage * itemsPerPage;
  // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
  const filteredOrders = orders.filter(
    (order) =>
      order.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phoneNumber.includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
      const fetchOrders = async () => {
        try {
          const response = await fetch("https://api.atoutfashion.com/api/orders");
          if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
          }
          const data = await response.json();
          console.log("Fetched Orders:", data);  // Log fetched data
          setOrders(data);
        } catch (error) {
          console.error("Error fetching orders:", error.message);
        }
      };
      

      fetchOrders();
    }, []);

  const handleEditClick = (order) => {
    console.log("Selected Order:", order);
    setSelectedOrder(order);

    const productsWithStatus = order.cartItems.map((product) => ({
      ...product,
      status: product.status || "Pending", 
    }));

    setUpdatedProducts(productsWithStatus);
    setIsModified(false);
  };

  const handleBackToTable = () => {
    setSelectedOrder(null);
    setUpdatedProducts([]);
    setIsModified(false);
  };

  const handleProductStatusChange = (index, newStatus) => {
    const updated = [...updatedProducts];
    updated[index].status = newStatus;
    setUpdatedProducts(updated);

    // Check if any product status has changed from its original value
    const hasChanges = updated.some(
      (product, idx) => product.status !== orders.find(order => order._id === selectedOrder._id)?.cartItems[idx].status
    );
    setIsModified(hasChanges);
  };
  

  const handleSaveChanges = async () => {
    if (!selectedOrder || !selectedOrder._id) {
      console.error("Selected order is invalid or null", selectedOrder);
      return;
    }
  
    console.log("Updating Order with ID:", selectedOrder._id); // Log order ID
  
    try {
      const response = await fetch(
        `https://api.atoutfashion.com/api/orders/${selectedOrder._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: selectedOrder.status,
            cartItems: updatedProducts,
          }),
        }
      );
      
  
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order
          )
        );
        alert("Order updated successfully!");
        handleBackToTable();
      } else {
        console.error("Failed to update order.");
      }
    } catch (error) {
      console.error("Error updating order:", error.message);
    }
  };
  
  
  const getSaveButtonColor = () => {
    if (isModified) {
      return "#28a745"; // Green when changes are made
    }
    return "#593E3E"; // Default color when no changes
  };

  
  
  
  

  return (
    <div className="container" style={{ marginTop: "2%", width: "94%" }}>
      {!selectedOrder ? (
        <>
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "20px" }}>Orders Management</h3>
        <div style={{ position: "relative", marginRight: "61px" }}>
          <input
            type="text"
            placeholder="Search"
            style={{ padding: '5px 10px 5px 30px', width: '200px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
      </div>
         
          <>
      <Table striped bordered hover style={{marginLeft:'-1%', width:'95%'}}>
        <thead>
          <tr style={{ textAlign: "center" }}>
            <th>Sl.no</th>
            <th>Customer Name</th>
            <th>Mobile Number</th>

            <th>Amount</th>
            <th>Payment</th>

            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.map((order, index) => (
            <tr key={order._id}>
              <td>{indexOfFirstItem + index + 1}</td>
              <td>{order.firstName}</td>
              <td>{order.phoneNumber}</td>
              <td>{order.totalAmount}</td>
              <td>{order.paymentMethod}</td>
              <td>{order.formattedDate}</td>
              <td>
                <Button
                  variant="info"
                  onClick={() => handleEditClick(order)}
                  style={{ cursor: "pointer", backgroundColor: "#593E3E", color: "#fff" }}
                >
                  Update
                </Button>
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
        </>
      ) : (
        <>
        <Button
          variant="secondary"
          onClick={handleBackToTable}
          style={{ marginBottom: "20px" }}
        >
          Back to Orders
        </Button>
        <h4>Order Details</h4>
        <Card className="mb-4 mx-auto" style={{ maxWidth: "600px" }}>
          <Card.Body>
            <h5>Customer: {selectedOrder.firstName}</h5>
            <p>
              <strong>Total Amount:</strong> ₹{selectedOrder.totalAmount}
              <br />
              <strong>Payment:</strong> {selectedOrder.paymentMethod}
              <br />
              <strong>Date:</strong> {selectedOrder.formattedDate}
              <br />
              {/* <strong>Status:</strong> {selectedOrder.status}
              <br /> */}
              <strong>Coupon:</strong> {selectedOrder.coupon}
              <br />
        <strong>Address:</strong> {selectedOrder.address?.address}, {selectedOrder.address?.city} <br />
        <strong>Phone Number:</strong> {selectedOrder.address?.number}
            </p>
          </Card.Body>
        </Card>
        <h5>Products</h5>
        <Row>
  {updatedProducts && updatedProducts.length > 0 ? (
    updatedProducts.map((product, index) => (
      <Col md={3} sm={6} xs={12} key={index} style={{ marginBottom: "15px" }}>
        <Card style={{ maxWidth: "230px", minHeight: "320px", margin: "auto" }}>
          <Card.Img
            variant="top"
            src={
              Array.isArray(product.images) && product.images.length > 0
                ? product.images[0]
                : "https://via.placeholder.com/200"
            }
            alt={product.name || "Product Image"}
            style={{
              height: "130px",
              objectFit: "cover",
              borderTopLeftRadius: "10px",
              borderTopRightRadius: "10px",
            }}
          />
          <Card.Body className="p-2">
            <Card.Title className="text-truncate" style={{ fontSize: "14px", fontWeight: "bold" }}>
              {product.name}
            </Card.Title>
            <Card.Text className="mb-1" style={{ fontSize: "12px" }}>Category: {product.category}</Card.Text>
            <Card.Text className="mb-1" style={{ fontSize: "12px" }}>₹{product.price}</Card.Text>
            <Card.Text className="mb-1" style={{ fontSize: "12px" }}>Qty: {product.quantity}</Card.Text>

            <Form>
              <Form.Group controlId={`status-${index}`}>
                <Form.Label style={{ fontSize: "12px", marginBottom: "2px" }}>Status</Form.Label>
                <Form.Control
                  as="select"
                  value={product.status || "Pending"}
                  style={{
                    backgroundColor: getSaveButtonColor(),
                    color: "#fff",
                    fontSize: "12px",
                    padding: "5px",
                  }}
                  onChange={(e) => handleProductStatusChange(index, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Ready for Dispatch">Ready for Dispatch</option>
                  <option value="Delivered">Delivered</option>
                </Form.Control>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    ))
  ) : (
    <p>No products available.</p>
  )}
</Row>



        <Button
          variant="primary"
          onClick={handleSaveChanges}
          style={{ marginTop: "20px",    backgroundColor: "#c77d7d", color: "#fff" }}
          disabled={!isModified} 
        >
          
          Save Changes
        </Button>
      </>
      
      )}
    </div>
  );
};

export default OrdersPage;
