
Built by https://www.blackbox.ai

---

# Play & Win - Gamified Clothing Store

## Project Overview
Play & Win is an engaging gamified marketing application for a clothing store that allows customers to earn rewards while shopping. Users can participate in games such as "Spin & Win" and "Scratch & Win" to potentially win discounts and other prizes. The application also features an admin dashboard for managing customer data and game results.

## Installation
To set up the project locally, follow these steps:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/play-and-win.git
   cd play-and-win
   ```

2. **Open the Project:**
   Open `index.html` in your web browser to view the game interface. For the admin dashboard, open `admin.html`.

3. **Serve Locally (Optional):**
   You can also use a local server like [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in Visual Studio Code for a better development experience.

## Usage
- **Customer Interface:**
  - Users can start playing by clicking the "Start Playing" button.
  - Select a game to play and try to win a reward.
  - After winning, users can fill out a lead form to claim their rewards.

- **Admin Dashboard:**
  - Admins can log in using demo credentials:
    - Email: `admin@example.com`
    - Password: `adminPass`
  - Admins can manage game results, apply filters, and export data.

## Features
- **Gamification:** 
  - "Spin & Win" and "Scratch & Win" games to engage customers.
  - Chance to win discounts or other prizes.
  
- **Lead Collection:**
  - Functionality to capture customer leads and their rewards.
  
- **Admin Management:**
  - The ability to filter results, manage statistics, and export data.
  
- **User-Friendly Interface:**
  - Responsive design and easy navigation for users and admins.

## Dependencies
There are no external dependencies mentioned in the project files. However, ensure you include the following standard libraries for optimal performance:

1. Google Fonts for the user interface styling.
2. CSS for styling (`css/style.css` and `css/admin.css`) and JavaScript files for application functionality.

## Project Structure
The project is structured as follows:

```
play-and-win/
├── index.html      # Customer interface
├── admin.html      # Admin dashboard
├── css/
│   ├── style.css   # Styles for the customer interface
│   └── admin.css   # Styles for the admin dashboard
├── js/
│   ├── utility.js   # Utility functions
│   ├── db.js        # Database management functions
│   ├── game.js      # Game logic and functionality
│   └── main.js      # Main functionality for customer interaction
```

### Note:
Make sure to customize the Google Review, Instagram page links, and WhatsApp number with actual values in `index.html` before deploying the application.

---

For any issues or feature requests, please open an issue in the [GitHub repository](https://github.com/yourusername/play-and-win/issues).