(function (global) {
  "use strict";

  /**
   * Fictional SQL showcasing relationship types supported by QueryAnalyzer.
   * All schemas, tables, and data are invented for demo purposes only.
   */
  var DEMO_QUERY =
    "-- Fictional demo query (no real data)\n" +
    "WITH\n" +
    "  product_dim AS (\n" +
    "    SELECT p.product_id, p.sku, c.category_name\n" +
    "    FROM demo_catalog.products p\n" +
    "    INNER JOIN demo_catalog.categories c ON c.category_id = p.category_id\n" +
    "    LEFT JOIN demo_catalog.brands b ON b.brand_id = p.brand_id\n" +
    "  ),\n" +
    "  order_core AS (\n" +
    "    SELECT o.order_id, o.customer_id, l.line_id, l.product_id, l.qty\n" +
    "    FROM demo_sales.orders o\n" +
    "    JOIN demo_sales.order_lines l ON l.order_id = o.order_id\n" +
    "    RIGHT JOIN demo_sales.promotions pr ON pr.promo_id = l.promo_id\n" +
    "  )\n" +
    "SELECT\n" +
    "  cust.customer_id,\n" +
    "  cust.name,\n" +
    "  ord.order_id,\n" +
    "  pd.sku,\n" +
    "  sh.shipped_at\n" +
    "FROM demo_sales.customers cust\n" +
    "INNER JOIN order_core ord ON ord.customer_id = cust.customer_id\n" +
    "LEFT JOIN demo_sales.shipments sh ON sh.order_id = ord.order_id\n" +
    "RIGHT JOIN demo_inventory.warehouses wh ON wh.warehouse_id = sh.warehouse_id\n" +
    "FULL OUTER JOIN demo_finance.invoices inv ON inv.order_id = ord.order_id\n" +
    "CROSS JOIN demo_ref.reporting_days rd\n" +
    "NATURAL JOIN demo_ref.regions reg\n" +
    "INNER JOIN product_dim pd ON pd.product_id = ord.product_id\n" +
    "INNER JOIN demo_hr.employees emp USING (employee_id)\n" +
    "LEFT JOIN (\n" +
    "  SELECT et.employee_id, et.territory_id\n" +
    "  FROM demo_hr.employee_territories et\n" +
    "  INNER JOIN demo_hr.territories t ON t.territory_id = et.territory_id\n" +
    ") terr ON terr.territory_id = cust.territory_id\n" +
    "INNER JOIN demo_legacy.accounts legacy ON legacy.account_id = cust.legacy_account_id\n" +
    "WHERE cust.status = 'active'\n" +
    "  AND inv.amount > 0;";

  global.QueryAnalyzer = global.QueryAnalyzer || {};
  global.QueryAnalyzer.DemoQuery = {
    get: function () {
      return DEMO_QUERY;
    },
  };
})(typeof window !== "undefined" ? window : this);
