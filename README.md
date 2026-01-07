# Blog Mobile - FIAP Tech Challenge

Este é o aplicativo mobile desenvolvido para o Tech Challenge, focado no gerenciamento de postagens de blog, alunos e professores. O projeto foi construído utilizando React Native com Expo.

## 🚀 Como Rodar o Projeto

### Pré-requisitos

*   [Node.js](https://nodejs.org/) instalado.
*   Gerenciador de pacotes (NPM ou Yarn).
*   Aplicativo **Expo Go** no seu celular ou um emulador (Android Studio/Xcode).
*   Backend da aplicação rodando (certifique-se de que o `BASE_URL` nos arquivos de serviço aponta para o IP correto da sua máquina/servidor).

### Passo a Passo Front-End

1.  **Instale as dependências:**

    ```bash
    npm install
    # ou
    yarn install
    ```

2.  **Inicie o servidor de desenvolvimento:**

    ```bash
    npx expo start
    ```

3.  **Execute no dispositivo:**
    *   **Físico:** Escaneie o QR Code exibido no terminal com o app Expo Go.
    *   **Emulador:** Pressione `a` para Android ou `i` para iOS no terminal.

---

## 🛠 Tecnologias Utilizadas

*   **Core:** React Native com Expo.
*   **Linguagem:** TypeScript para tipagem estática e segurança no código.
*   **Navegação:** React Navigation (Stack e/ou Tab navigation).
*   **Armazenamento Local:** `AsyncStorage` para persistência de token de autenticação e perfil do usuário.
*   **Estilização:**
    *   `StyleSheet` nativo.
    *   `expo-linear-gradient` para fundos com gradiente.
    *   `@expo/vector-icons` (Feather) para ícones.
*   **Integração API:** `fetch` nativo para comunicação REST com o backend.

---

### Instruções Back-End

Seguir documentação disponível no repositório: [Back-end Blog Academy](https://github.com/MelqSantos/blogAcademy)

---

## ✨ Funcionalidades

O aplicativo possui controle de acesso baseado no perfil do usuário (`ALUNO` ou `PROFESSOR`), alterando a visibilidade de ações.

### 1. Blog (Home)
*   **Listagem:** Visualização de posts com título, assunto (tag), conteúdo resumido, autor e data.
*   **Busca:** Filtro em tempo real por título, conteúdo ou assunto.
*   **Gestão:** Usuários com perfil de **Professor** podem criar, editar ou excluir posts existentes.

### 2. Gestão de Professores
*   **Listagem:** Exibe nome, email, usuário e data de nascimento dos professores cadastrados.
*   **Busca:** Filtro por nome, email ou usuário.
*   **CRUD:**
    *   Adicioar, editar e excluir professores existentes (perfil Professor).

### 3. Gestão de Alunos
*   **Listagem:** Exibe nome, email, usuário e data de nascimento dos alunos.
*   **Busca:** Filtro por nome, email ou usuário.
*   **CRUD:**
    *   Adicionar, editar e excluir alunos existentes (perfil Professor).

### 4. Autenticação e Segurança
*   Login com persistência de sessão via Token Bearer.
*   Verificação de perfil (`role`) para renderização condicional de botões de ação.
*   Tratamento de erros de conexão e feedback visual (Loaders e Alertas).