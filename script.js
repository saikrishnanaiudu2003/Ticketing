document.getElementById('addTicketBtn').addEventListener('click', function() {
    document.getElementById('popupForm').classList.add('show');
});

document.getElementById('ticketForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const trackingId = document.getElementById('trackingId').value;
    const orderId = document.getElementById('orderId').value;
    const utrNumber = document.getElementById('utrNumber').value;
    const complaint = document.getElementById('complaint').value;
    const userId = 'some-user-id'; // Replace with the actual user ID or get it dynamically

    const data = { trackingId, orderId, utrNumber, complaint, userId };

    // Send data to Flask backend using fetch
    fetch('http://127.0.0.1:5000/add_ticket', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => {throw new Error(text)});
        }
        return response.json();
    })
    .then(data => {
        showMessage('Ticket added successfully!', 'success');
        document.getElementById('popupForm').classList.remove('show');
        refreshComplaintsTable();
    })
    .catch((error) => {
        console.error('Error:', error);
        showMessage('An error occurred. Please try again.', 'error');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    refreshComplaintsTable();
});

function refreshComplaintsTable() {
    const userId = 'some-user-id'; // Replace with the actual user ID or get it dynamically

    // Fetch complaints for the admin view
    fetch('http://127.0.0.1:5000/admin/tickets')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#complaints-table tbody');
            tableBody.innerHTML = ''; // Clear any existing content

            data.forEach(complaint => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${complaint.id}</td>
                    <td>${complaint.order_id}</td>
                    <td>${complaint.tracking_id}</td>
                    <td>${complaint.utr_number}</td>
                    <td>${complaint.complaint}</td>
                    <td>${complaint.response ? complaint.response : 'No response yet'}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching complaints:', error);
            showMessage('Failed to load complaints. Please try again later.', 'error');
        });

    // Fetch complaints for the user view (if needed)
    fetch(`http://127.0.0.1:5000/user/tickets?user_id=${userId}`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#complaints-table tbody');
            tableBody.innerHTML = ''; // Clear any existing content

            data.forEach(complaint => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${complaint.id}</td>
                    <td>${complaint.order_id}</td>
                    <td>${complaint.tracking_id}</td>
                    <td>${complaint.utr_number}</td>
                    <td>${complaint.complaint}</td>
                    <td>${complaint.response ? complaint.response : 'No response yet'}</td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching complaints:', error);
            showMessage('Failed to load complaints. Please try again later.', 'error');
        });
}

function showMessage(message, type) {
    const messageSection = document.getElementById('messageSection');
    const messageElement = document.getElementById('message');
    
    // Set message text and class based on type
    messageElement.textContent = message;
    messageSection.className = `message-section ${type}`;
    
    // Show message section
    messageSection.style.display = 'block';

    // Hide message after 5 seconds
    setTimeout(() => {
        messageSection.style.display = 'none';
    }, 5000);
}
