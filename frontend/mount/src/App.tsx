import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Page404 from './pages/Page404';
import NavBar from './components/NavBar';
import ConfirmEmailPage from './pages/ConfirmEmailPage';
import { UserProvider } from './context/UserContext';
import OauthPage from './pages/OauthPage';
import SignInPage from './pages/SignInPage';
import SignOutPage from './pages/SignOutPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SettingsPage from './pages/SettingsPage';
import Footer from './components/Footer';
import ProfilePage from './pages/ProfilePage';
import ViewImage from './pages/ViewOneImage';
import DetailsUserListsPage from './pages/DetailsUserListsPage';
import TrackingOnline from './components/auth/TrackingOnline';
import NotificationsPage from './pages/NotificationsPage';
import ChatPage from './pages/ChatPage';
import FindUserPage from './pages/FindPage';
import MapUsersPage from './pages/MapUsersPage';

function App() {
    return (
        <UserProvider>
            <Router>
				<TrackingOnline />
                <NavBar />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route
                        path="/confirm/:idConfirm"
                        element={<ConfirmEmailPage />}
                    />
                    <Route path="/signin" element={<SignInPage />} />
					<Route path="/signin/:method" element={<OauthPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/signout" element={<SignOutPage />} />
					<Route path="/forgot/:idConfirm" element={<ResetPasswordPage />} />
                    <Route path="/forgot" element={<ForgotPasswordPage />} />
					<Route path="/settings" element={<SettingsPage />} />
					<Route path="/profile/image/:id" element={<ViewImage />} />
					<Route path="/profile/option/:option" element={<DetailsUserListsPage />} />
					<Route path="/profile/:id" element={<ProfilePage />} />
					<Route path="/profile" element={<ProfilePage />} />
					<Route path="/notifications" element={<NotificationsPage />} />
					<Route path="/chat" element={<ChatPage />} />
					<Route path="/find" element={<FindUserPage />} />
					<Route path="/map" element={<MapUsersPage />} />
                    <Route path="/404" element={<Page404 />} />
                    <Route path="*" element={<Page404 />} />
                </Routes>
				<Footer />
            </Router>
        </UserProvider>
    );
}

export default App;
