import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TransferList = () => {
    const [transfers, setTransfers] = useState([]);


    // Transfer verilerini alır
    useEffect(() => {
        const fetchTransfers = async () => {
            try {
                const response = await axios.get('/transfers', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                });
                setTransfers(response.data);
            } catch (error) {
                console.error("An error occurred while fetching transfer data:", error);
            }
        };

        fetchTransfers();
    }, []);

    return (
        <div>
            <h2>Transfer List</h2>
            <table>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Age</th>
                        <th>Market Value</th>
                        <th>From Team Name</th>
                        <th>To Team Name</th>
                        <th>Transfer Date</th>
                        <th>Transfer Fee</th>
                        <th>Position</th>
                        <th>Country</th>
                    </tr>
                </thead>
                <tbody>
                    {transfers.map((transfer, index) => (
                        <tr key={index}>
                            <td>{transfer.first_name}</td>
                            <td>{transfer.last_name}</td>
                            <td>{transfer.age}</td>
                            <td>{transfer.market_value}</td>
                            <td>{transfer.from_team_name}</td>
                            <td>{transfer.to_team_name}</td>
                            <td>{new Date(transfer.transfer_date).toLocaleDateString()}</td>
                            <td>${transfer.transfer_fee}</td>
                            <td>{transfer.position}</td>
                            <td>{transfer.country}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransferList;
