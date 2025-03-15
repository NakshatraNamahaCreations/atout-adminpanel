import React, { useState, useEffect } from 'react';
import { Pagination } from "react-bootstrap";
import { FaArrowLeft, FaTrash } from 'react-icons/fa';

function Customer() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchCustomers();
  }, []);

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

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://api.atoutfashion.com/api/customers/delete/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setCustomers(customers.filter((customer) => customer._id !== id));
      } else {
        throw new Error('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    (customer.username && customer.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.mobilenumber && customer.mobilenumber.toString().includes(searchTerm))
  );

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="container" style={{ marginTop: '1%' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search"
          style={{ padding: '5px 10px', width: '200px' }}
          value={searchTerm}
          onChange={handleSearchChange}
        />
        
      </div>

      <table className="table table-bordered" style={{ width: '97%' }}>
        <thead>
          <tr style={{textAlign:'center'}}>
            <th>Sl No</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentCustomers.map((customer, index) => (
            <tr key={customer._id}>
              <td>{indexOfFirstItem + index + 1}</td>
              <td>{customer.username}</td>
              <td>{customer.mobilenumber}</td>
              <td>{customer.email}</td>
              <td>
                <FaTrash
                  onClick={() => handleDelete(customer._id)}
                  style={{ cursor: 'pointer', color: 'red' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
  );
}

export default Customer;
