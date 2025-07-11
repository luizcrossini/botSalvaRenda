// frontend/public/js/main.js
import { API_BASE } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1) Recupera token do localStorage
  const token = localStorage.getItem('token');

  if (!token) {
    console.warn('🔒 Token não encontrado: redirecionando para login');
    return window.location.href = 'login.html'
  }
fetch('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error('Token inválido ou expirado');
      }
      return res.json();
    })
    .then(data => {
      console.log('✅ Usuário autenticado:', data.user);
      document.getElementById('user-info').textContent = `Olá, ${data.user.fullname} !`;
      localStorage.setItem('user_id', data.user.id);
    })
    .catch(err => {
      console.error('❌ Falha na autenticação:', err.message);
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
});
  

