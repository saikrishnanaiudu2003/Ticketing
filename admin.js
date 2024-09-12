document.addEventListener('DOMContentLoaded', () => {
    const replyPopup = document.getElementById('replyPopup');
    const replyForm = document.getElementById('replyForm');
    const closeReplyPopup = document.getElementById('closeReplyPopup');

    // Fetch tickets and populate the table
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
                    <td><button class="reply-btn" data-id="${complaint.id}">Reply</button></td>
                `;
                tableBody.appendChild(row);
            });

            // Add event listener for reply buttons
            document.querySelectorAll('.reply-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const complaintId = this.getAttribute('data-id');
                    document.getElementById('replyId').value = complaintId;
                    replyPopup.classList.add('show');
                });
            });
        })
        .catch(error => {
            console.error('Error fetching complaints:', error);
        });

    // Handle reply form submission
    replyForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const replyId = document.getElementById('replyId').value;
        const replyMessage = document.getElementById('replyMessage').value;

        const data = { response: replyMessage };

        fetch(`http://127.0.0.1:5000/admin/respond_ticket/${replyId}`, {
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
            alert('Reply sent successfully!');
            replyPopup.classList.remove('show');
            // Optionally refresh the table or update the row to show the response
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    });

    // Handle popup form close
    closeReplyPopup.addEventListener('click', () => {
        replyPopup.classList.remove('show');
    });
});
