# ☀️ SkyView

### Aplicativo de Previsão do Tempo com Arquitetura Modular
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)  
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)  
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)  
![Open-Meteo](https://img.shields.io/badge/Open--Meteo-API-blue?style=for-the-badge)

[Demo](https://chatgpt.com/c/68f7904b-8090-8325-aab2-9b97b855f563#-demonstra%C3%A7%C3%A3o) • [Instalação](https://chatgpt.com/c/68f7904b-8090-8325-aab2-9b97b855f563#-instala%C3%A7%C3%A3o) • [Uso](https://chatgpt.com/c/68f7904b-8090-8325-aab2-9b97b855f563#-como-usar) • [Arquitetura](https://chatgpt.com/c/68f7904b-8090-8325-aab2-9b97b855f563#-arquitetura-solid)

----------
## 📋 Sobre o Projeto

O **SkyView** é um aplicativo web de previsão do tempo desenvolvido com **JavaScript puro**, aplicando princípios de **Clean Code** e **SOLID**.  
Focado em **modularização, manutenibilidade e escalabilidade**, ele utiliza a API gratuita **Open-Meteo** para exibir dados meteorológicos precisos de qualquer cidade do mundo.

### 🎯 Objetivo
Criar uma aplicação simples, mas profissional, que sirva como **referência para o desenvolvimento front-end moderno**, mostrando como uma **arquitetura limpa e modular** pode tornar o código mais legível e fácil de manter.

----------

## ✨ Funcionalidades

-   🔍 Busca de cidades em tempo real
-   🌡️ Exibição da temperatura atual (°C)
-   💧 Índice de umidade relativa
-   💨 Velocidade do vento
-   🌧️ Índice de precipitação
-   📊 Pressão atmosférica
-   🎨 Interface moderna e responsiva
-   ⚡ Carregamento rápido (resposta da API < 10ms)
-   🌐 Suporte global para qualquer cidade
-   🔒 Sem necessidade de API Key
   
----------

## 🚀 Instalação

### Pré-requisitos

-   Navegador web moderno (Chrome, Firefox, Edge ou Safari)
-   Nenhuma dependência externa necessária
    
### Passo a Passo
1.  **Clone o repositório**
    ```bash
    git clone https://github.com/seu-usuario/skyview.git
    ```
2.  **Acesse a pasta do projeto**
    ```bash
    cd skyview
    ```
3.  **Abra o arquivo index.html**
    ```bash
    # Linux/Mac
    open index.html
    
    # Windows
    start index.html
    
    # Ou simplesmente dê duplo clique no arquivo
    
    ```
### 💡 Alternativa: Servidor Local
Para uma experiência ideal com módulos ES6:
```bash
# Usando Python 3
python -m http.server 8000

# Usando Node.js (http-server)
npx http-server -p 8000

# Acesse no navegador:
http://localhost:8000

```
## 💻 Como Usar
1.  Digite o **nome de uma cidade** no campo de busca.
2.  Clique em **“Buscar”** ou pressione **Enter**.
3.  Veja as informações meteorológicas em tempo real.
    

### Exemplos de Cidades
-   São Paulo
-   Rio de Janeiro
-   New York
-   London
-   Tokyo

---

## 🏗️ Estrutura do Projeto
```
skyview/
│
├── index.html          # Estrutura HTML principal
├── css/
│   └── styles.css      # Estilos e animações
├── js/
│   ├── api.js          # Comunicação com a API
│   ├── ui.js           # Interface do usuário e DOM
│   └── main.js         # Controlador principal
└── README.md           # Documentação do projeto

```
----------
## 🎯 Arquitetura SOLID
O projeto implementa os **princípios SOLID** para garantir um código limpo, reutilizável e fácil de manter.
### 1️⃣ Single Responsibility Principle (SRP)
Cada módulo possui uma única responsabilidade:
-   **api.js:** Requisições HTTP e integração com a API
-   **ui.js:** Manipulação do DOM e exibição de dados
-   **main.js:** Coordenação entre os módulos
```js
// ✅ Correto - Cada função faz apenas uma coisa
export async function getCityCoordinates(cityName) { ... }
export async function getWeatherData(latitude, longitude) { ... }
```
### 2️⃣ Open/Closed Principle (OCP)
O código é aberto para extensão, mas fechado para modificação.
```js
const API_CONFIG = {
  geocoding: 'https://geocoding-api.open-meteo.com/v1/search',
  weather: 'https://api.open-meteo.com/v1/forecast'
  // Adicione novas APIs sem alterar o código existente
};
```
### 3️⃣ Liskov Substitution Principle (LSP)
Funções retornam estruturas consistentes, permitindo substituição sem quebra.
```js
export async function getCityCoordinates(cityName) { ... }
export async function getWeatherData(latitude, longitude) { ... }
```
### 4️⃣ Interface Segregation Principle (ISP)
Cada módulo exporta apenas o que é necessário.
```js
export { showLoading, hideLoading, showError, displayWeather };
```
### 5️⃣ Dependency Inversion Principle (DIP)
Módulos de alto nível dependem de abstrações, não de implementações específicas.
```js
import { getCompleteWeatherData } from './api.js';
import { showLoading, displayWeather } from './ui.js';
```
----------
## 🛠️ Tecnologias Utilizadas
-   **HTML5** – Estrutura semântica
-   **CSS3** – Estilização com Flexbox e Grid
-   **JavaScript (ES6+)** – Modularidade, async/await
-   **Open-Meteo API** – Dados meteorológicos gratuitos
-   **Fetch API** – Requisições HTTP nativas
    
----------
## 🎨 Características Técnicas
### Performance
-   ⚡ Resposta da API < 10ms
-   📦 Zero dependências externas (~10KB)
-   🚀 Lazy loading de módulos
  
### Responsividade
-   📱 Design mobile-first
-   💻 Adaptável a qualquer resolução
-   🎯 Breakpoints otimizados
    

### Acessibilidade

-   ♿ Navegação por teclado
-   🎨 Contraste adequado (WCAG 2.1)
-   📢 Mensagens de erro acessíveis
   
----------

## 🤝 Como Contribuir
Contribuições são sempre bem-vindas!
1.  **Faça um fork do projeto**
2.  **Crie uma branch para sua feature**
    ```bash
    git checkout -b feature/minha-feature
    ```
3.  **Commit suas mudanças**
    ```bash
    git commit -m "Adiciona minha feature"
    ```
4.  **Envie sua branch**
    ```bash
    git push origin feature/minha-feature
    ```
5.  **Abra um Pull Request**
---

### 💡 Ideias de Contribuição
-   Adicionar previsão de 7 dias
-   Implementar gráficos de temperatura
-   Adicionar tema escuro
-   Salvar cidades favoritas no LocalStorage
-   Geolocalização automática
-   Testes unitários
-   Internacionalização (i18n)
    

----------

## 📝 Licença

Este projeto está sob a licença **MIT**.  
Consulte o arquivo [LICENSE](https://chatgpt.com/c/LICENSE) para mais detalhes.

---

## 👨‍💻 Autor
**William Martins**
-   GitHub: [@willmartinsss](https://github.com/willmartinsss)
-   LinkedIn: [William Almeida](https://www.linkedin.com/in/william-m-almeida/)
-   Email: [williammartins323@gmail.com](mailto:williammartins323@gmail.com)
    
----------

## 🙏 Agradecimentos

-   [Open-Meteo](https://open-meteo.com/) – API gratuita e open-source
-   [Shields.io](https://shields.io/) – Badges para README
 -   Comunidade JavaScript 💛
    
----------
## 📚 Referências
-   [Documentação da Open-Meteo](https://open-meteo.com/en/docs)
-   [JavaScript Modules - MDN](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Modules)
 -   [Princípios SOLID explicados](https://medium.com/desenvolvendo-com-paixao/o-que-%C3%A9-solid-o-guia-completo-para-voc%C3%AA-entender-os-5-princ%C3%ADpios-da-poo-2b937b3fc530)
   
----------

### ⭐ Se este projeto te ajudou, deixe uma estrela!
**Feito com ❤️ e JavaScript.**

