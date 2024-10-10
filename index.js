// index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

let leaderboard = []; // Temporary leaderboard data

// Dummy database for users and their balances
let users = {};

// Route to place a bet
app.post('/api/bet', (req, res) => {
    const { username, betAmount } = req.body;
    
    if (!username || !betAmount) {
        return res.status(400).json({ message: "Username and bet amount are required." });
    }
    
    if (!users[username]) {
        users[username] = { balance: 1.0, wins: 0 }; // Default balance in BTC
    }

    if (users[username].balance < betAmount) {
        return res.status(400).json({ message: "Insufficient balance." });
    }

    // Simple random multiplier logic
    const multiplier = Math.random() * (3 - 1) + 1; // Between 1x and 3x
    const payout = betAmount * multiplier;

    users[username].balance -= betAmount;
    users[username].balance += payout;
    users[username].wins += 1;

    // Update leaderboard
    leaderboard.push({ player: username, wins: users[username].wins });
    leaderboard = [...new Map(leaderboard.map(item => [item['player'], item])).values()]; // Remove duplicates

    res.json({ message: "Bet placed!", multiplier, payout, balance: users[username].balance });
});

// Route to get leaderboard
app.get('/api/leaderboard', (req, res) => {
    res.json(leaderboard.sort((a, b) => b.wins - a.wins));
});

// Route to get user balance
app.get('/api/balance/:username', (req, res) => {
    const { username } = req.params;
    if (users[username]) {
        return res.json({ balance: users[username].balance });
    }
    res.status(404).json({ message: "User not found." });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
