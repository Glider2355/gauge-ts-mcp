export const apiTestingTemplate = {
  specContent: (projectName: string) => `# ${projectName} API テスト

## RESTful API の基本テスト

APIの基本的な機能をテストします。

* "API サーバー" に接続
* "GET /users" で "ユーザー一覧を取得"
* "POST /users" で "新しいユーザーを作成"
* "PUT /users/<id>" で "ユーザー情報を更新"
* "DELETE /users/<id>" で "ユーザーを削除"

## APIテストデータ

|ユーザーID|名前|メール|
|---|---|---|
|1|田中太郎|tanaka@example.com|
|2|佐藤花子|sato@example.com|
|3|鈴木一郎|suzuki@example.com|`,

  stepsContent: (projectName: string) => `import { Step } from "gauge-ts";
import axios from "axios";

export default class ${projectName}ApiSteps {
  private baseUrl = process.env.API_BASE_URL || "http://localhost:3000";
  private response: any;

  @Step("API サーバー")
  public async connectToApi() {
    console.log(\`API サーバー \${this.baseUrl} に接続中...\`);
  }

  @Step("GET /users")
  public async getUsersList() {
    this.response = await axios.get(\`\${this.baseUrl}/users\`);
    console.log("ユーザー一覧を取得しました");
  }

  @Step("ユーザー一覧を取得")
  public async verifyUsersList() {
    console.log(\`取得したユーザー数: \${this.response.data.length}\`);
  }

  @Step("POST /users")
  public async createUser() {
    const userData = { name: "テストユーザー", email: "test@example.com" };
    this.response = await axios.post(\`\${this.baseUrl}/users\`, userData);
    console.log("新しいユーザーを作成しました");
  }

  @Step("新しいユーザーを作成")
  public async verifyUserCreation() {
    console.log(\`作成されたユーザーID: \${this.response.data.id}\`);
  }

  @Step("PUT /users/<id>")
  public async updateUser(id: string) {
    const userData = { name: "更新されたユーザー", email: "updated@example.com" };
    this.response = await axios.put(\`\${this.baseUrl}/users/\${id}\`, userData);
    console.log(\`ユーザー \${id} を更新しました\`);
  }

  @Step("ユーザー情報を更新")
  public async verifyUserUpdate() {
    console.log("ユーザー情報の更新を確認しました");
  }

  @Step("DELETE /users/<id>")
  public async deleteUser(id: string) {
    this.response = await axios.delete(\`\${this.baseUrl}/users/\${id}\`);
    console.log(\`ユーザー \${id} を削除しました\`);
  }

  @Step("ユーザーを削除")
  public async verifyUserDeletion() {
    console.log("ユーザーの削除を確認しました");
  }
}`,

  setupContent: () => `import { beforeSuite, afterSuite } from "gauge-ts";

export default class ApiTestSetup {

  @beforeSuite
  public async setUp() {
    console.log("APIテストの初期設定...");
    // テスト環境の確認
    // 認証トークンの取得等
  }

  @afterSuite
  public async tearDown() {
    console.log("APIテストの後処理...");
    // テストデータのクリーンアップ等
  }
}`,
};
