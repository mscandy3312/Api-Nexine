# 💻 Ejemplos de Código - API Naxine

## 🚀 Ejemplos por Lenguaje

### JavaScript/TypeScript

#### Cliente API Básico
```typescript
class NaxineClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Autenticación
  async register(userData: {
    nombre: string;
    email: string;
    password: string;
    telefono?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(response.token);
    return response;
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  // Profesionales
  async getProfesionales(filters: {
    especialidad?: string;
    ubicacion?: string;
    disponible?: boolean;
    page?: number;
    limit?: number;
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    return this.request(`/api/profesionales?${params}`);
  }

  async getProfesional(id: number) {
    return this.request(`/api/profesionales/${id}`);
  }

  // Sesiones
  async getSesiones(filters: {
    profesional_id?: number;
    cliente_id?: number;
    estado?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    return this.request(`/api/sesiones?${params}`);
  }

  async createSesion(sesionData: {
    id_profesional: number;
    id_cliente: number;
    fecha_hora: string;
    duracion_minutos: number;
    tipo_consulta: string;
    motivo_consulta: string;
  }) {
    return this.request('/api/sesiones', {
      method: 'POST',
      body: JSON.stringify(sesionData),
    });
  }

  async updateSesion(id: number, updates: {
    estado?: string;
    notas_profesional?: string;
  }) {
    return this.request(`/api/sesiones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Valoraciones
  async getValoraciones(filters: {
    profesional_id?: number;
    cliente_id?: number;
    calificacion?: number;
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    return this.request(`/api/valoraciones?${params}`);
  }

  async createValoracion(valoracionData: {
    id_profesional: number;
    id_cliente: number;
    calificacion: number;
    comentario?: string;
  }) {
    return this.request('/api/valoraciones', {
      method: 'POST',
      body: JSON.stringify(valoracionData),
    });
  }
}

// Uso del cliente
const api = new NaxineClient();

// Ejemplo de uso completo
async function ejemploCompleto() {
  try {
    // 1. Registro
    const registro = await api.register({
      nombre: 'Juan Pérez',
      email: 'juan@ejemplo.com',
      password: 'Contraseña123',
      telefono: '+1234567890'
    });
    console.log('Usuario registrado:', registro);

    // 2. Login
    const login = await api.login('juan@ejemplo.com', 'Contraseña123');
    console.log('Login exitoso:', login);

    // 3. Obtener perfil
    const perfil = await api.getProfile();
    console.log('Perfil:', perfil);

    // 4. Buscar profesionales
    const profesionales = await api.getProfesionales({
      especialidad: 'cardiologia',
      disponible: true
    });
    console.log('Profesionales:', profesionales);

    // 5. Crear sesión
    const sesion = await api.createSesion({
      id_profesional: 1,
      id_cliente: 2,
      fecha_hora: '2024-02-15T10:00:00.000Z',
      duracion_minutos: 60,
      tipo_consulta: 'Presencial',
      motivo_consulta: 'Revisión cardiológica'
    });
    console.log('Sesión creada:', sesion);

    // 6. Crear valoración
    const valoracion = await api.createValoracion({
      id_profesional: 1,
      id_cliente: 2,
      calificacion: 5,
      comentario: 'Excelente profesional'
    });
    console.log('Valoración creada:', valoracion);

  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

#### React Hook Personalizado
```typescript
import { useState, useEffect, useCallback } from 'react';

interface UseNaxineAPI {
  login: (email: string, password: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  getProfesionales: (filters?: any) => Promise<any>;
  getSesiones: (filters?: any) => Promise<any>;
  createSesion: (sesionData: any) => Promise<any>;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  user: any | null;
}

export const useNaxineAPI = (): UseNaxineAPI => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = new NaxineClient();

  useEffect(() => {
    if (token) {
      api.setToken(token);
    }
  }, [token]);

  const handleRequest = useCallback(async (requestFn: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await requestFn();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    return handleRequest(async () => {
      const response = await api.login(email, password);
      setToken(response.token);
      setUser(response.user);
      return response;
    });
  }, [handleRequest]);

  const register = useCallback(async (userData: any) => {
    return handleRequest(async () => {
      return await api.register(userData);
    });
  }, [handleRequest]);

  const getProfesionales = useCallback(async (filters?: any) => {
    return handleRequest(async () => {
      return await api.getProfesionales(filters);
    });
  }, [handleRequest]);

  const getSesiones = useCallback(async (filters?: any) => {
    return handleRequest(async () => {
      return await api.getSesiones(filters);
    });
  }, [handleRequest]);

  const createSesion = useCallback(async (sesionData: any) => {
    return handleRequest(async () => {
      return await api.createSesion(sesionData);
    });
  }, [handleRequest]);

  return {
    login,
    register,
    getProfesionales,
    getSesiones,
    createSesion,
    loading,
    error,
    isAuthenticated: !!token,
    user
  };
};
```

#### Componente React de Ejemplo
```tsx
import React, { useState, useEffect } from 'react';
import { useNaxineAPI } from './useNaxineAPI';

const ProfesionalesList: React.FC = () => {
  const { getProfesionales, loading, error } = useNaxineAPI();
  const [profesionales, setProfesionales] = useState([]);
  const [filters, setFilters] = useState({
    especialidad: '',
    ubicacion: '',
    disponible: true
  });

  useEffect(() => {
    loadProfesionales();
  }, [filters]);

  const loadProfesionales = async () => {
    try {
      const response = await getProfesionales(filters);
      setProfesionales(response.profesionales);
    } catch (err) {
      console.error('Error cargando profesionales:', err);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="filters">
        <input
          type="text"
          placeholder="Especialidad"
          value={filters.especialidad}
          onChange={(e) => handleFilterChange('especialidad', e.target.value)}
        />
        <input
          type="text"
          placeholder="Ubicación"
          value={filters.ubicacion}
          onChange={(e) => handleFilterChange('ubicacion', e.target.value)}
        />
        <label>
          <input
            type="checkbox"
            checked={filters.disponible}
            onChange={(e) => handleFilterChange('disponible', e.target.checked)}
          />
          Solo disponibles
        </label>
      </div>

      <div className="profesionales">
        {profesionales.map((profesional: any) => (
          <div key={profesional.id_profesional} className="profesional-card">
            <h3>{profesional.usuario.nombre}</h3>
            <p>Especialidad: {profesional.especialidad}</p>
            <p>Ubicación: {profesional.ubicacion}</p>
            <p>Precio: ${profesional.precio_consulta}</p>
            <p>Calificación: {profesional.calificacion_promedio}/5</p>
            <button>Agendar Cita</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfesionalesList;
```

---

### Python

#### Cliente API en Python
```python
import requests
import json
from typing import Optional, Dict, Any, List

class NaxineClient:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.session = requests.Session()
    
    def set_token(self, token: str):
        """Establece el token de autenticación"""
        self.token = token
        self.session.headers.update({
            'Authorization': f'Bearer {token}'
        })
    
    def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Realiza una petición HTTP"""
        url = f"{self.base_url}{endpoint}"
        headers = {
            'Content-Type': 'application/json',
            **kwargs.get('headers', {})
        }
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        kwargs['headers'] = headers
        
        try:
            response = self.session.request(method, url, **kwargs)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            try:
                error_data = response.json()
                raise Exception(error_data.get('error', {}).get('message', str(e)))
            except:
                raise Exception(f"HTTP {response.status_code}: {e}")
    
    # Autenticación
    def register(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Registra un nuevo usuario"""
        return self._request('POST', '/auth/register', json=user_data)
    
    def login(self, email: str, password: str) -> Dict[str, Any]:
        """Inicia sesión y obtiene token"""
        response = self._request('POST', '/auth/login', json={
            'email': email,
            'password': password
        })
        self.set_token(response['token'])
        return response
    
    def get_profile(self) -> Dict[str, Any]:
        """Obtiene el perfil del usuario autenticado"""
        return self._request('GET', '/auth/profile')
    
    # Profesionales
    def get_profesionales(self, filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Obtiene lista de profesionales con filtros"""
        params = {}
        if filters:
            params = {k: v for k, v in filters.items() if v is not None}
        
        return self._request('GET', '/api/profesionales', params=params)
    
    def get_profesional(self, id_profesional: int) -> Dict[str, Any]:
        """Obtiene un profesional específico"""
        return self._request('GET', f'/api/profesionales/{id_profesional}')
    
    # Sesiones
    def get_sesiones(self, filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Obtiene lista de sesiones con filtros"""
        params = {}
        if filters:
            params = {k: v for k, v in filters.items() if v is not None}
        
        return self._request('GET', '/api/sesiones', params=params)
    
    def create_sesion(self, sesion_data: Dict[str, Any]) -> Dict[str, Any]:
        """Crea una nueva sesión"""
        return self._request('POST', '/api/sesiones', json=sesion_data)
    
    def update_sesion(self, id_sesion: int, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Actualiza una sesión existente"""
        return self._request('PUT', f'/api/sesiones/{id_sesion}', json=updates)
    
    # Valoraciones
    def get_valoraciones(self, filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Obtiene lista de valoraciones con filtros"""
        params = {}
        if filters:
            params = {k: v for k, v in filters.items() if v is not None}
        
        return self._request('GET', '/api/valoraciones', params=params)
    
    def create_valoracion(self, valoracion_data: Dict[str, Any]) -> Dict[str, Any]:
        """Crea una nueva valoración"""
        return self._request('POST', '/api/valoraciones', json=valoracion_data)

# Ejemplo de uso
def ejemplo_python():
    api = NaxineClient()
    
    try:
        # 1. Registro
        registro = api.register({
            'nombre': 'Juan Pérez',
            'email': 'juan@ejemplo.com',
            'password': 'Contraseña123',
            'telefono': '+1234567890'
        })
        print('Usuario registrado:', registro)
        
        # 2. Login
        login = api.login('juan@ejemplo.com', 'Contraseña123')
        print('Login exitoso:', login)
        
        # 3. Obtener perfil
        perfil = api.get_profile()
        print('Perfil:', perfil)
        
        # 4. Buscar profesionales
        profesionales = api.get_profesionales({
            'especialidad': 'cardiologia',
            'disponible': True
        })
        print('Profesionales:', profesionales)
        
        # 5. Crear sesión
        sesion = api.create_sesion({
            'id_profesional': 1,
            'id_cliente': 2,
            'fecha_hora': '2024-02-15T10:00:00.000Z',
            'duracion_minutos': 60,
            'tipo_consulta': 'Presencial',
            'motivo_consulta': 'Revisión cardiológica'
        })
        print('Sesión creada:', sesion)
        
    except Exception as e:
        print(f'Error: {e}')

if __name__ == "__main__":
    ejemplo_python()
```

---

### PHP

#### Cliente API en PHP
```php
<?php

class NaxineClient {
    private $baseUrl;
    private $token;
    private $httpClient;

    public function __construct($baseUrl = 'http://localhost:3000') {
        $this->baseUrl = $baseUrl;
        $this->httpClient = new GuzzleHttp\Client();
    }

    public function setToken($token) {
        $this->token = $token;
    }

    private function request($method, $endpoint, $data = null) {
        $url = $this->baseUrl . $endpoint;
        $headers = [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        ];

        if ($this->token) {
            $headers['Authorization'] = 'Bearer ' . $this->token;
        }

        $options = [
            'headers' => $headers
        ];

        if ($data) {
            $options['json'] = $data;
        }

        try {
            $response = $this->httpClient->request($method, $url, $options);
            return json_decode($response->getBody(), true);
        } catch (GuzzleHttp\Exception\ClientException $e) {
            $error = json_decode($e->getResponse()->getBody(), true);
            throw new Exception($error['error']['message'] ?? $e->getMessage());
        }
    }

    // Autenticación
    public function register($userData) {
        return $this->request('POST', '/auth/register', $userData);
    }

    public function login($email, $password) {
        $response = $this->request('POST', '/auth/login', [
            'email' => $email,
            'password' => $password
        ]);
        
        $this->setToken($response['token']);
        return $response;
    }

    public function getProfile() {
        return $this->request('GET', '/auth/profile');
    }

    // Profesionales
    public function getProfesionales($filters = []) {
        $queryString = http_build_query(array_filter($filters));
        $endpoint = '/api/profesionales' . ($queryString ? '?' . $queryString : '');
        return $this->request('GET', $endpoint);
    }

    public function getProfesional($id) {
        return $this->request('GET', "/api/profesionales/{$id}");
    }

    // Sesiones
    public function getSesiones($filters = []) {
        $queryString = http_build_query(array_filter($filters));
        $endpoint = '/api/sesiones' . ($queryString ? '?' . $queryString : '');
        return $this->request('GET', $endpoint);
    }

    public function createSesion($sesionData) {
        return $this->request('POST', '/api/sesiones', $sesionData);
    }

    public function updateSesion($id, $updates) {
        return $this->request('PUT', "/api/sesiones/{$id}", $updates);
    }

    // Valoraciones
    public function getValoraciones($filters = []) {
        $queryString = http_build_query(array_filter($filters));
        $endpoint = '/api/valoraciones' . ($queryString ? '?' . $queryString : '');
        return $this->request('GET', $endpoint);
    }

    public function createValoracion($valoracionData) {
        return $this->request('POST', '/api/valoraciones', $valoracionData);
    }
}

// Ejemplo de uso
function ejemploPHP() {
    $api = new NaxineClient();

    try {
        // 1. Registro
        $registro = $api->register([
            'nombre' => 'Juan Pérez',
            'email' => 'juan@ejemplo.com',
            'password' => 'Contraseña123',
            'telefono' => '+1234567890'
        ]);
        echo "Usuario registrado: " . json_encode($registro) . "\n";

        // 2. Login
        $login = $api->login('juan@ejemplo.com', 'Contraseña123');
        echo "Login exitoso: " . json_encode($login) . "\n";

        // 3. Obtener perfil
        $perfil = $api->getProfile();
        echo "Perfil: " . json_encode($perfil) . "\n";

        // 4. Buscar profesionales
        $profesionales = $api->getProfesionales([
            'especialidad' => 'cardiologia',
            'disponible' => true
        ]);
        echo "Profesionales: " . json_encode($profesionales) . "\n";

        // 5. Crear sesión
        $sesion = $api->createSesion([
            'id_profesional' => 1,
            'id_cliente' => 2,
            'fecha_hora' => '2024-02-15T10:00:00.000Z',
            'duracion_minutos' => 60,
            'tipo_consulta' => 'Presencial',
            'motivo_consulta' => 'Revisión cardiológica'
        ]);
        echo "Sesión creada: " . json_encode($sesion) . "\n";

    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
}

// Ejecutar ejemplo
ejemploPHP();
?>
```

---

### C# (.NET)

#### Cliente API en C#
```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Collections.Generic;

public class NaxineClient
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;
    private string _token;

    public NaxineClient(string baseUrl = "http://localhost:3000")
    {
        _baseUrl = baseUrl;
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Add("Content-Type", "application/json");
    }

    public void SetToken(string token)
    {
        _token = token;
        _httpClient.DefaultRequestHeaders.Authorization = 
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
    }

    private async Task<T> RequestAsync<T>(HttpMethod method, string endpoint, object data = null)
    {
        var url = $"{_baseUrl}{endpoint}";
        var request = new HttpRequestMessage(method, url);

        if (data != null)
        {
            var json = JsonSerializer.Serialize(data);
            request.Content = new StringContent(json, Encoding.UTF8, "application/json");
        }

        try
        {
            var response = await _httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                var error = JsonSerializer.Deserialize<ApiError>(content);
                throw new Exception(error.Error.Message);
            }

            return JsonSerializer.Deserialize<T>(content);
        }
        catch (HttpRequestException ex)
        {
            throw new Exception($"Error de conexión: {ex.Message}");
        }
    }

    // Autenticación
    public async Task<AuthResponse> RegisterAsync(UserData userData)
    {
        return await RequestAsync<AuthResponse>(HttpMethod.Post, "/auth/register", userData);
    }

    public async Task<AuthResponse> LoginAsync(string email, string password)
    {
        var response = await RequestAsync<AuthResponse>(HttpMethod.Post, "/auth/login", new { email, password });
        SetToken(response.Token);
        return response;
    }

    public async Task<UserResponse> GetProfileAsync()
    {
        return await RequestAsync<UserResponse>(HttpMethod.Get, "/auth/profile");
    }

    // Profesionales
    public async Task<ProfesionalesResponse> GetProfesionalesAsync(Dictionary<string, object> filters = null)
    {
        var queryString = "";
        if (filters != null)
        {
            var parameters = new List<string>();
            foreach (var filter in filters)
            {
                if (filter.Value != null)
                {
                    parameters.Add($"{filter.Key}={filter.Value}");
                }
            }
            queryString = "?" + string.Join("&", parameters);
        }

        return await RequestAsync<ProfesionalesResponse>(HttpMethod.Get, $"/api/profesionales{queryString}");
    }

    public async Task<ProfesionalResponse> GetProfesionalAsync(int id)
    {
        return await RequestAsync<ProfesionalResponse>(HttpMethod.Get, $"/api/profesionales/{id}");
    }

    // Sesiones
    public async Task<SesionesResponse> GetSesionesAsync(Dictionary<string, object> filters = null)
    {
        var queryString = "";
        if (filters != null)
        {
            var parameters = new List<string>();
            foreach (var filter in filters)
            {
                if (filter.Value != null)
                {
                    parameters.Add($"{filter.Key}={filter.Value}");
                }
            }
            queryString = "?" + string.Join("&", parameters);
        }

        return await RequestAsync<SesionesResponse>(HttpMethod.Get, $"/api/sesiones{queryString}");
    }

    public async Task<SesionResponse> CreateSesionAsync(SesionData sesionData)
    {
        return await RequestAsync<SesionResponse>(HttpMethod.Post, "/api/sesiones", sesionData);
    }
}

// Modelos de datos
public class UserData
{
    public string Nombre { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public string Telefono { get; set; }
}

public class AuthResponse
{
    public bool Success { get; set; }
    public string Token { get; set; }
    public Usuario User { get; set; }
}

public class Usuario
{
    public int IdUsuario { get; set; }
    public string Nombre { get; set; }
    public string Email { get; set; }
    public string Telefono { get; set; }
    public string Rol { get; set; }
    public bool Activo { get; set; }
}

public class Profesional
{
    public int IdProfesional { get; set; }
    public int IdUsuario { get; set; }
    public string Especialidad { get; set; }
    public string CedulaProfesional { get; set; }
    public int ExperienciaAnos { get; set; }
    public string Ubicacion { get; set; }
    public decimal PrecioConsulta { get; set; }
    public bool Disponible { get; set; }
    public decimal? CalificacionPromedio { get; set; }
    public int? TotalValoraciones { get; set; }
    public Usuario Usuario { get; set; }
}

public class ProfesionalesResponse
{
    public bool Success { get; set; }
    public List<Profesional> Profesionales { get; set; }
}

public class ProfesionalResponse
{
    public bool Success { get; set; }
    public Profesional Profesional { get; set; }
}

public class SesionData
{
    public int IdProfesional { get; set; }
    public int IdCliente { get; set; }
    public string FechaHora { get; set; }
    public int DuracionMinutos { get; set; }
    public string TipoConsulta { get; set; }
    public string MotivoConsulta { get; set; }
}

public class Sesion
{
    public int IdSesion { get; set; }
    public int IdProfesional { get; set; }
    public int IdCliente { get; set; }
    public string FechaHora { get; set; }
    public int DuracionMinutos { get; set; }
    public string TipoConsulta { get; set; }
    public string Estado { get; set; }
    public string MotivoConsulta { get; set; }
}

public class SesionesResponse
{
    public bool Success { get; set; }
    public List<Sesion> Sesiones { get; set; }
}

public class SesionResponse
{
    public bool Success { get; set; }
    public Sesion Sesion { get; set; }
}

public class ApiError
{
    public ErrorInfo Error { get; set; }
}

public class ErrorInfo
{
    public string Message { get; set; }
}

// Ejemplo de uso
class Program
{
    static async Task Main(string[] args)
    {
        var api = new NaxineClient();

        try
        {
            // 1. Registro
            var registro = await api.RegisterAsync(new UserData
            {
                Nombre = "Juan Pérez",
                Email = "juan@ejemplo.com",
                Password = "Contraseña123",
                Telefono = "+1234567890"
            });
            Console.WriteLine($"Usuario registrado: {JsonSerializer.Serialize(registro)}");

            // 2. Login
            var login = await api.LoginAsync("juan@ejemplo.com", "Contraseña123");
            Console.WriteLine($"Login exitoso: {JsonSerializer.Serialize(login)}");

            // 3. Obtener perfil
            var perfil = await api.GetProfileAsync();
            Console.WriteLine($"Perfil: {JsonSerializer.Serialize(perfil)}");

            // 4. Buscar profesionales
            var profesionales = await api.GetProfesionalesAsync(new Dictionary<string, object>
            {
                ["especialidad"] = "cardiologia",
                ["disponible"] = true
            });
            Console.WriteLine($"Profesionales: {JsonSerializer.Serialize(profesionales)}");

            // 5. Crear sesión
            var sesion = await api.CreateSesionAsync(new SesionData
            {
                IdProfesional = 1,
                IdCliente = 2,
                FechaHora = "2024-02-15T10:00:00.000Z",
                DuracionMinutos = 60,
                TipoConsulta = "Presencial",
                MotivoConsulta = "Revisión cardiológica"
            });
            Console.WriteLine($"Sesión creada: {JsonSerializer.Serialize(sesion)}");

        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
```

---

## 🧪 Testing y Debugging

### Health Check
```bash
curl -X GET http://localhost:3000/health
```

### Test de Autenticación
```bash
# Registro
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test User",
    "email": "test@ejemplo.com",
    "password": "Test123456",
    "telefono": "+1234567890"
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "Test123456"
  }'
```

### Test de Profesionales
```bash
# Listar profesionales
curl -X GET "http://localhost:3000/api/profesionales?especialidad=cardiologia&disponible=true"

# Obtener profesional específico
curl -X GET http://localhost:3000/api/profesionales/1
```

---

**¡Ejemplos listos para integrar con cualquier frontend! 🚀**
