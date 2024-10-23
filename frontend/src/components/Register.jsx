// src/components/Register.jsx
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }
    try {
      await register(formData.username, formData.email, formData.password)
      navigate('/login')
    } catch (err) {
      setError('Erro ao criar conta')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold text-center text-purple-600 mb-6">Criar Conta</h2>
          {/* Similar ao Login, mas com campos adicionais */}
        </form>
      </div>
    </div>
  )
}

export default Register
