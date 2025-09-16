# Configuración de AWS Cognito para Naxine

## Pasos para configurar AWS Cognito

### 1. Crear User Pool en AWS Cognito

1. **Acceder a AWS Console**
   - Ve a [AWS Console](https://console.aws.amazon.com/)
   - Busca "Cognito" en los servicios
   - Selecciona "User Pools"

2. **Crear User Pool**
   - Haz clic en "Create user pool"
   - Configura el nombre: `naxine-user-pool`
   - Selecciona "Step through settings"

3. **Configurar Atributos**
   - **Standard attributes**: Selecciona `email` y `name`
   - **Custom attributes**: Agrega:
     - `custom:role` (String) - Para almacenar el rol del usuario
   - **Required attributes**: Marca `email` como requerido

4. **Configurar Políticas de Contraseña**
   - Mínimo 8 caracteres
   - Requerir mayúsculas, minúsculas, números y símbolos
   - No permitir contraseñas comunes

5. **Configurar MFA (Opcional)**
   - Puedes habilitar MFA para mayor seguridad
   - Recomendado para producción

6. **Configurar Verificación de Email**
   - Selecciona "Send email with Cognito"
   - O configura tu propio servicio de email

7. **Configurar Tags (Opcional)**
   - Agrega tags para organización

8. **Crear User Pool**
   - Revisa la configuración
   - Haz clic en "Create"

### 2. Crear App Client

1. **En el User Pool creado**
   - Ve a la pestaña "App clients"
   - Haz clic en "Create app client"

2. **Configurar App Client**
   - Nombre: `naxine-app-client`
   - **Authentication flows**:
     - ✅ ALLOW_USER_SRP_AUTH
     - ✅ ALLOW_USER_PASSWORD_AUTH
     - ✅ ALLOW_REFRESH_TOKEN_AUTH
   - **Token expiration**:
     - Access token: 1 hour
     - ID token: 1 hour
     - Refresh token: 30 days

3. **Crear App Client**
   - Haz clic en "Create"

### 3. Configurar Atributos Personalizados

1. **En el User Pool**
   - Ve a "Sign-up experience"
   - En "Required attributes", asegúrate de que `email` esté marcado
   - En "Custom attributes", verifica que `custom:role` esté configurado

### 4. Obtener Credenciales

1. **User Pool ID**
   - Copia el ID del User Pool (formato: `us-east-1_XXXXXXXXX`)

2. **App Client ID**
   - Ve a "App clients"
   - Copia el Client ID

3. **AWS Credentials**
   - Ve a IAM en AWS Console
   - Crea un usuario con políticas para Cognito
   - O usa las credenciales de tu cuenta AWS

### 5. Configurar Variables de Entorno

Actualiza tu archivo `config.js`:

```javascript
module.exports = {
  // ... otras configuraciones
  
  // AWS Configuration
  AWS_REGION: 'us-east-1', // o tu región preferida
  AWS_ACCESS_KEY_ID: 'tu_aws_access_key_id',
  AWS_SECRET_ACCESS_KEY: 'tu_aws_secret_access_key',
  
  // AWS Cognito Configuration
  COGNITO_USER_POOL_ID: 'us-east-1_XXXXXXXXX',
  COGNITO_CLIENT_ID: 'tu_cognito_client_id',
  
  // ... resto de configuraciones
};
```

### 6. Políticas IAM Requeridas

Crea un usuario IAM con las siguientes políticas:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminUpdateUserAttributes",
        "cognito-idp:AdminDeleteUser",
        "cognito-idp:AdminSetUserPassword",
        "cognito-idp:ListUsers"
      ],
      "Resource": "arn:aws:cognito-idp:us-east-1:ACCOUNT_ID:userpool/USER_POOL_ID"
    }
  ]
}
```

### 7. Probar la Configuración

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Ejecutar la aplicación**
   ```bash
   npm start
   ```

3. **Probar endpoints**
   ```bash
   npm test
   ```

### 8. Endpoints de Prueba

- **Registro**: `POST /auth/register`
- **Login**: `POST /auth/login`
- **Verificación**: `GET /auth/verify-email/:token`
- **Perfil**: `GET /auth/profile` (requiere token)
- **Sincronización**: `POST /auth/sync-cognito` (solo administradores)

### 9. Monitoreo y Logs

- Revisa los logs de CloudWatch para Cognito
- Monitorea el uso de la API
- Configura alertas para errores de autenticación

### 10. Consideraciones de Seguridad

- Usa HTTPS en producción
- Configura CORS apropiadamente
- Implementa rate limiting
- Monitorea intentos de login fallidos
- Usa políticas de contraseña fuertes
- Considera habilitar MFA para usuarios sensibles

## Troubleshooting

### Error: "User does not exist"
- Verifica que el User Pool ID sea correcto
- Asegúrate de que el usuario esté creado en Cognito

### Error: "Invalid credentials"
- Verifica las credenciales de AWS
- Asegúrate de que el usuario IAM tenga los permisos correctos

### Error: "Token verification failed"
- Verifica que el Client ID sea correcto
- Asegúrate de que la región sea la correcta

### Error: "Custom attribute not found"
- Verifica que el atributo `custom:role` esté configurado en el User Pool
- Asegúrate de que el atributo esté marcado como mutable

