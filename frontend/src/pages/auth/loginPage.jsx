import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Loader } from "lucide-react";
import InputField from "../../components/auth/InputField";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

function LoginPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading, error } = useAuthStore();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const loggedInUser = await login(formData.email, formData.password);
            if (!loggedInUser) return;

            if (loggedInUser.role === "superadmin") {
                navigate("/super-admin-dashboard");
            } else if (!loggedInUser.isVerified) {
                navigate("/verify-email");
            } else {
                navigate("/user_dashboard");
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-6">
            <div className="bg-white p-10 rounded-2xl shadow-lg w-[430px] max-w-full mx-4">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome Back</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        icon={<Mail size={20} color="black" />}
                    />
                    <InputField
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        icon={<Lock size={20} color="black" />}
                        toggleIcon={showPassword ? <EyeOff size={20} color="black" /> : <Eye size={20} color="black" />}
                        onToggle={() => setShowPassword(!showPassword)}
                    />
                    <Link
                        to="/forgot-password"
                        role="link"
                        className="block text-right text-sm text-blue-600 hover:underline cursor-pointer mt-3"
                    >
                        Forgot Password?
                    </Link>

                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mt-4 rounded-lg text-center mx-auto w-full">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        className="w-full bg-[#5C8D7D] text-white py-3 rounded-xl hover:bg-[#8ab5a7] transition shadow-md mt-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                        type="submit"
                    >
                        {isLoading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : "Login"}
                    </button>
                </form>
                <p className="text-center text-sm mt-3 text-black">
                    Don't have an account?{" "}
                    <Link to="/signup" role="link" className="text-blue-600 hover:underline cursor-pointer">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
