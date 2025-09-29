# Implementação do Cálculo de Tempo de Entrega

## Funcionalidades Implementadas

### 1. Backend - Serviço de Roteamento (`RoutingService.js`)

#### Novas Funções:

- **`calculateDeliveryTime(droneId, orderId)`**: Calcula o tempo de entrega para um pedido específico
- **`calculateDroneDeliveryTimes(droneId)`**: Calcula tempos de entrega para todos os pedidos de um drone

#### Características:

- Considera a velocidade máxima do drone (obtida do tipo de drone)
- Calcula distância real considerando zonas de no-fly
- Converte distância de metros para km para cálculo de tempo
- Retorna tempo formatado (horas, minutos, segundos)
- Inclui informações detalhadas: distância, velocidade, waypoints

### 2. Backend - API Endpoints

#### Novas Rotas (`RoutingRoutes.js`):

- `GET /api/routing/delivery-time/:droneId/:orderId` - Calcular tempo de entrega específico
- `GET /api/routing/delivery-times/:droneId` - Calcular tempos de entrega do drone

#### Controller (`RoutingController.js`):

- Métodos para lidar com as novas rotas
- Tratamento de erros adequado
- Respostas padronizadas

### 3. Frontend - Serviço de API (`api.js`)

#### Novas Funções:

- `calculateDeliveryTime(droneId, orderId)` - Chamada para API de tempo específico
- `calculateDroneDeliveryTimes(droneId)` - Chamada para API de tempos do drone

### 4. Frontend - Interface do Usuário

#### Página de Gerenciamento de Drones (`DroneOrders.jsx`):

- Exibe tempo de entrega para cada pedido do drone
- Mostra distância percorrida e velocidade do drone
- Indicador de carregamento durante cálculo
- Tratamento de erros

#### Página de Gerenciamento de Pedidos (`OrderManagement.jsx`):

- Modal de detalhes ao clicar em um pedido
- Cálculo automático de tempo de entrega
- Exibição de informações detalhadas: distância, velocidade, waypoints
- Interface responsiva e intuitiva

## Fatores Considerados no Cálculo

### 1. Proporção da Malha

- Cada unidade da malha = 100 metros
- Conversão automática de unidades para metros

### 2. Zonas de No-Fly

- Algoritmo A\* para contornar zonas proibidas
- Cálculo de rota otimizada que evita restrições
- Distância real considerando desvios necessários

### 3. Velocidade do Drone

- Velocidade máxima obtida do tipo de drone
- Cálculo baseado na velocidade real do drone
- Tempo calculado em horas, convertido para formato legível

## Exemplo de Resposta da API

```json
{
  "success": true,
  "data": {
    "droneId": "drone-123",
    "orderId": "order-456",
    "distance": 1500.5,
    "maxSpeed": 50,
    "timeInHours": 0.03,
    "timeInMinutes": 1.8,
    "timeFormatted": "1m 48s",
    "route": [
      { "x": 25, "y": 25 },
      { "x": 26, "y": 26 },
      { "x": 30, "y": 30 }
    ],
    "waypoints": 3
  }
}
```

## Como Usar

### 1. Na Página de Drones:

1. Clique em "Ver Pedidos" em qualquer drone
2. Os tempos de entrega são calculados automaticamente
3. Informações detalhadas são exibidas para cada pedido

### 2. Na Página de Pedidos:

1. Clique em qualquer pedido na tabela
2. Modal de detalhes é aberto
3. Tempo de entrega é calculado automaticamente se o pedido estiver alocado

## Teste da Implementação

Execute o script de teste:

```bash
node test_delivery_time_calculation.js
```

O script irá:

1. Buscar ou criar um drone de teste
2. Buscar ou criar um pedido de teste
3. Testar o cálculo de tempo de entrega
4. Verificar a precisão dos cálculos
5. Testar a API completa

## Melhorias Futuras

1. **Cache de Cálculos**: Implementar cache para evitar recálculos desnecessários
2. **Tempo Real**: Atualização em tempo real dos tempos de entrega
3. **Otimização de Rotas**: Considerar múltiplos pedidos na mesma rota
4. **Fatores Adicionais**: Considerar vento, tráfego aéreo, etc.
5. **Histórico**: Manter histórico de tempos de entrega para análise
