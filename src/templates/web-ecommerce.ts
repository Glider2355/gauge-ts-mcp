export const webEcommerceTemplate = {
  specContent: (projectName: string) => `# ${projectName} ECサイトテスト

## 商品購入フローのテスト

ECサイトの基本的な購入フローをテストします。

* "ECサイトにアクセス"する
* "商品を検索"して "商品 <商品名>" を見つける
* "商品を カート に追加"する
* "チェックアウトページ"に移動
* "注文を完了"する

## 商品カテゴリテスト

|商品名|カテゴリ|価格|
|---|---|---|
|スマートフォン|電子機器|50000|
|ノートパソコン|電子機器|80000|
|Tシャツ|衣類|2000|`,

  stepsContent: (projectName: string) => `import { Step } from "gauge-ts";

export default class ${projectName}ECommerceSteps {

  @Step("ECサイトにアクセス")
  public async accessECommerceSite() {
    console.log("ECサイトにアクセスしています...");
  }

  @Step("商品を検索")
  public async searchProduct() {
    console.log("商品を検索しています...");
  }

  @Step("商品 <product> を見つける")
  public async findProduct(product: string) {
    console.log(\`商品 \${product} を検索しています...\`);
  }

  @Step("商品を カート に追加")
  public async addToCart() {
    console.log("商品をカートに追加しています...");
  }

  @Step("チェックアウトページ")
  public async goToCheckout() {
    console.log("チェックアウトページに移動しています...");
  }

  @Step("注文を完了")
  public async completeOrder() {
    console.log("注文を完了しています...");
  }
}`,

  setupContent:
    () => `import { beforeSuite, afterSuite, beforeScenario } from "gauge-ts";

export default class ECommerceSetup {

  @beforeSuite
  public async setUp() {
    console.log("ECサイトテストの初期設定...");
    // テストデータの準備
    // ブラウザの初期化等
  }

  @beforeScenario
  public async beforeScenario() {
    console.log("シナリオ開始前の準備...");
    // カートの初期化
    // ユーザーログイン等
  }

  @afterSuite
  public async tearDown() {
    console.log("ECサイトテストの後処理...");
    // テストデータのクリーンアップ
    // ブラウザの終了等
  }
}`,
};
