export const basicWebTemplate = {
  specContent: (projectName: string) => `# ${projectName} テスト仕様書

## ${projectName}の基本機能テスト

このシナリオでは、${projectName}の基本的な機能をテストします。

* "サイトにアクセス"する
* "ページが正常に表示される"ことを確認
* "ナビゲーションメニュー"をテスト
* "基本的なユーザー操作"を実行`,

  stepsContent: (projectName: string) => `import { Step } from "gauge-ts";

export default class ${projectName}Steps {

  @Step("サイトにアクセス")
  public async accessSite() {
    // サイトアクセスの実装
    console.log("サイトにアクセスしています...");
  }

  @Step("ページが正常に表示される")
  public async verifyPageDisplay() {
    // ページ表示確認の実装
    console.log("ページの表示を確認しています...");
  }

  @Step("ナビゲーションメニュー")
  public async testNavigation() {
    // ナビゲーションテストの実装
    console.log("ナビゲーションをテストしています...");
  }

  @Step("基本的なユーザー操作")
  public async basicUserOperation() {
    // 基本操作の実装
    console.log("基本的なユーザー操作を実行しています...");
  }
}`,

  setupContent: () => `import { beforeSuite, afterSuite } from "gauge-ts";

export default class Setup {

  @beforeSuite
  public async setUp() {
    console.log("テスト開始前のセットアップを実行...");
    // 初期データの準備、データベース接続等
  }

  @afterSuite
  public async tearDown() {
    console.log("テスト終了後のクリーンアップを実行...");
    // リソースのクリーンアップ等
  }
}`,
};
