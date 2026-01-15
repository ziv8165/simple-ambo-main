import AdminDashboard from './pages/AdminDashboard';
import AdminEditListing from './pages/AdminEditListing';
import AdminSettings from './pages/AdminSettings';
import BookingManagement from './pages/BookingManagement';
import Chat from './pages/Chat';
import CompareListings from './pages/CompareListings';
import CreateListing from './pages/CreateListing';
import Home from './pages/Home';
import HostDashboard from './pages/HostDashboard';
import ListingDetails from './pages/ListingDetails';
import MatchListings from './pages/MatchListings';
import Matches from './pages/Matches';
import MatchingQuiz from './pages/MatchingQuiz';
import MyFavorites from './pages/MyFavorites';
import MyMatches from './pages/MyMatches';
import ReviewSubmission from './pages/ReviewSubmission';
import UserProfile from './pages/UserProfile';
import UserProfile360 from './pages/UserProfile360';
import UsersDirectory from './pages/UsersDirectory';
import AdminHub from './pages/AdminHub';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "AdminEditListing": AdminEditListing,
    "AdminSettings": AdminSettings,
    "BookingManagement": BookingManagement,
    "Chat": Chat,
    "CompareListings": CompareListings,
    "CreateListing": CreateListing,
    "Home": Home,
    "HostDashboard": HostDashboard,
    "ListingDetails": ListingDetails,
    "MatchListings": MatchListings,
    "Matches": Matches,
    "MatchingQuiz": MatchingQuiz,
    "MyFavorites": MyFavorites,
    "MyMatches": MyMatches,
    "ReviewSubmission": ReviewSubmission,
    "UserProfile": UserProfile,
    "UserProfile360": UserProfile360,
    "UsersDirectory": UsersDirectory,
    "AdminHub": AdminHub,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};