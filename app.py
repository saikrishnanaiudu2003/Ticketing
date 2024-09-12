from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
import certifi
from bson import ObjectId

# Configuration
app = Flask(__name__)
app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb+srv://myAtlasDBUser:Sai123@myatlasclusteredu.qifwasp.mongodb.net/python?retryWrites=true&w=majority')

CORS(app)

# MongoDB connection
client = MongoClient(app.config['MONGO_URI'], tlsCAFile=certifi.where())
db = client['python']
tickets_collection = db['tickets']

@app.route('/add_ticket', methods=['POST'])
def add_ticket():
    try:
        data = request.get_json()
        new_ticket = {
            "tracking_id": data.get('trackingId'),
            "order_id": data.get('orderId'),
            "utr_number": data.get('utrNumber'),
            "complaint": data.get('complaint'),
            "user_id": data.get('userId'),  # Store the user ID
            "response": None  # Initialize response field
        }
        ticket_id = tickets_collection.insert_one(new_ticket).inserted_id
        return jsonify({"message": "Ticket added successfully!", "ticket_id": str(ticket_id)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/admin/tickets', methods=['GET'])
def get_admin_tickets():
    try:
        tickets = tickets_collection.find()
        ticket_list = []
        for ticket in tickets:
            ticket_list.append({
                "id": str(ticket['_id']),
                "tracking_id": ticket['tracking_id'],
                "order_id": ticket['order_id'],
                "utr_number": ticket['utr_number'],
                "complaint": ticket['complaint'],
                "response": ticket.get('response')
            })
        return jsonify(ticket_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/user/tickets', methods=['GET'])
def get_user_tickets():
    try:
        user_id = request.args.get('user_id')  # Get the user_id from query parameters
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400

        tickets = tickets_collection.find({"user_id": user_id})
        ticket_list = []
        for ticket in tickets:
            ticket_list.append({
                "id": str(ticket['_id']),
                "tracking_id": ticket['tracking_id'],
                "order_id": ticket['order_id'],
                "utr_number": ticket['utr_number'],
                "complaint": ticket['complaint'],
                "response": ticket.get('response')
            })
        return jsonify(ticket_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/admin/respond_ticket/<ticket_id>', methods=['POST'])
def respond_ticket(ticket_id):
    try:
        data = request.get_json()
        response_message = data.get('response')

        if not ObjectId.is_valid(ticket_id):
            return jsonify({"error": "Invalid ticket ID"}), 400

        result = tickets_collection.update_one(
            {"_id": ObjectId(ticket_id)},
            {"$set": {"response": response_message}}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Ticket not found"}), 404

        return jsonify({"message": "Response added successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
