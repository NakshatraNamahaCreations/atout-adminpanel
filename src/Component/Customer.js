import React, { useState, useEffect } from 'react';
import { Pagination } from "react-bootstrap";
import { FaArrowLeft, FaTrash } from 'react-icons/fa';

function Customer() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  
  const totalPages = Math.ceil(customers.length / itemsPerPage);

  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = customers.slice(indexOfFirstItem, indexOfLastItem);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('https://api.atoutfashion.com/api/customers/all');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
  
    
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };
  

  useEffect(() => {
    fetchCustomers(); // Call the fetch function when the component mounts
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleRowClick = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleBackClick = () => {
    setSelectedCustomer(null);
  };

  // Function to handle customer deletion
  const handleDelete = async (id) => {
    console.log("Deleting customer with id:", id);  // Add this line for debugging
    try {
      const response = await fetch(`https://api.atoutfashion.com/api/customers/delete/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCustomers(customers.filter((customer) => customer._id !== id)); // Use _id or uniqueId based on your model
      } else {
        throw new Error('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };
  

  const filteredCustomers = customers.filter((customer) =>
    (customer.username && customer.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  

  return (
    <div className="container" style={{ marginTop: '1%' }}>
      {selectedCustomer ? (
        <div>
          <FaArrowLeft onClick={handleBackClick} style={{ marginBottom: '10px', cursor: 'pointer' }} />
          <h3>Customer Details</h3>
          <>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>SL No</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {currentCustomers.map((customer, index) => (
            <tr key={customer._id}>
              <td>{indexOfFirstItem + index + 1}</td>
              <td>{customer.username}</td>
              <td>{customer.mobilenumber}</td>
              <td>{customer.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      
    </>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ position: 'relative', marginRight: '10px' }}>
              <input
                type="text"
                placeholder="Search"
                style={{ padding: '5px 10px 5px 30px', width: '200px' }}
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <i
                className="fa fa-search"
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              ></i>
            </div>
            <i className="fa fa-filter" style={{ marginRight: '10px' }}></i>
          </div>

          <table className="table table-bordered" style={{ marginLeft: '-2%', width: '95%' }}>
            <thead style={{ textAlign: 'center' }}>
              <tr>
                <th>Sl No</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, index) => (
                <tr key={index} >
                  <td onClick={() => handleRowClick(customer)}>{index + 1}</td>
                  <td onClick={() => handleRowClick(customer)}>
                    {/* <img src={customer.pictureUrl} alt="Customer" style={{ width: '30px', height: '30px', borderRadius: '50%' }} /> */}
                    {customer.username}
                  </td>
                  <td onClick={() => handleRowClick(customer)}>{customer.mobilenumber}</td>
                  <td onClick={() => handleRowClick(customer)}>{customer.email}</td>
                  <td>
                    <FaTrash
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        handleDelete(customer._id);
                      }}
                      style={{ cursor: 'pointer', color: 'red' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        </div>
      )}
    </div>
  );
}

export default Customer;
