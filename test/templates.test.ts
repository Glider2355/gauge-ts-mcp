import { describe, it, expect } from "vitest";
import {
  getTemplate,
  getAvailableTemplates,
  TEMPLATES,
} from "../src/templates/index.js";

describe("Templates", () => {
  describe("getAvailableTemplates", () => {
    it("利用可能なテンプレート一覧を返す", () => {
      const templates = getAvailableTemplates();
      expect(templates).toContain("basic-web");
      expect(templates).toContain("web-ecommerce");
      expect(templates).toContain("api-testing");
      expect(templates.length).toBe(3);
    });
  });

  describe("getTemplate", () => {
    it("存在するテンプレートを取得できる", () => {
      const template = getTemplate("basic-web");
      expect(template).toBeDefined();
      expect(template?.specContent).toBeTypeOf("function");
      expect(template?.stepsContent).toBeTypeOf("function");
      expect(template?.setupContent).toBeTypeOf("function");
    });

    it("存在しないテンプレートの場合nullを返す", () => {
      const template = getTemplate("non-existent");
      expect(template).toBeNull();
    });
  });

  describe("basic-web template", () => {
    it("プロジェクト名を含むspecコンテンツを生成する", () => {
      const template = getTemplate("basic-web");
      const specContent = template?.specContent("MyProject");
      expect(specContent).toContain("MyProject");
      expect(specContent).toContain("# MyProject テスト仕様書");
    });

    it("プロジェクト名を含むstepsコンテンツを生成する", () => {
      const template = getTemplate("basic-web");
      const stepsContent = template?.stepsContent("MyProject");
      expect(stepsContent).toContain("MyProjectSteps");
      expect(stepsContent).toContain('@Step("サイトにアクセス")');
    });

    it("setupコンテンツを生成する", () => {
      const template = getTemplate("basic-web");
      const setupContent = template?.setupContent();
      expect(setupContent).toContain("beforeSuite");
      expect(setupContent).toContain("afterSuite");
    });
  });

  describe("web-ecommerce template", () => {
    it("ECサイト関連のコンテンツを含む", () => {
      const template = getTemplate("web-ecommerce");
      const specContent = template?.specContent("ECommerceTest");
      expect(specContent).toContain("ECサイトテスト");
      expect(specContent).toContain("商品購入フロー");

      const stepsContent = template?.stepsContent("ECommerceTest");
      expect(stepsContent).toContain("ECommerceTestECommerceSteps");
      expect(stepsContent).toContain("ECサイトにアクセス");
    });
  });

  describe("api-testing template", () => {
    it("API関連のコンテンツを含む", () => {
      const template = getTemplate("api-testing");
      const specContent = template?.specContent("ApiTest");
      expect(specContent).toContain("API テスト");
      expect(specContent).toContain("RESTful API");

      const stepsContent = template?.stepsContent("ApiTest");
      expect(stepsContent).toContain("ApiTestApiSteps");
      expect(stepsContent).toContain("import axios");
    });
  });
});
