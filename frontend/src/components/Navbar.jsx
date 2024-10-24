import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-purple-600 font-bold text-xl">
              Alfabetizar com Amor
            </Link>
          </div>
          <div className="flex items-center">
            {user ? (
              <button
                onClick={logout}
                className="text-purple-600 hover:text-purple-800"
              >
                Sair
              </button>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="text-purple-600 hover:text-purple-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
