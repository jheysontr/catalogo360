/**
 * =============================================================
 * ROW LEVEL SECURITY (RLS) — Documentación de políticas
 * =============================================================
 *
 * Este archivo documenta las políticas RLS configuradas en la
 * base de datos. NO contiene lógica ejecutable.
 *
 * ---------------------------------------------------------
 * TABLA: stores
 * ---------------------------------------------------------
 * SELECT  → Público (anyone can view stores)
 * INSERT  → Solo propietario (auth.uid() = user_id)
 * UPDATE  → Solo propietario (auth.uid() = user_id)
 * DELETE  → Solo propietario (auth.uid() = user_id)
 *
 * ---------------------------------------------------------
 * TABLA: products
 * ---------------------------------------------------------
 * SELECT  → Público (anyone can view products)
 * INSERT  → Solo propietario de la tienda
 *           (EXISTS stores WHERE id = store_id AND user_id = auth.uid())
 * UPDATE  → Solo propietario de la tienda
 * DELETE  → Solo propietario de la tienda
 *
 * ---------------------------------------------------------
 * TABLA: categories
 * ---------------------------------------------------------
 * SELECT  → Público
 * INSERT  → Solo propietario de la tienda
 * UPDATE  → Solo propietario de la tienda
 * DELETE  → Solo propietario de la tienda
 *
 * ---------------------------------------------------------
 * TABLA: orders
 * ---------------------------------------------------------
 * SELECT  → Solo propietario de la tienda
 * INSERT  → Público (cualquier cliente puede crear pedidos)
 * UPDATE  → Solo propietario de la tienda
 * DELETE  → No permitido
 *
 * ---------------------------------------------------------
 * TABLA: profiles
 * ---------------------------------------------------------
 * SELECT  → Solo el propio usuario (auth.uid() = user_id)
 * INSERT  → Solo el propio usuario
 * UPDATE  → Solo el propio usuario
 * DELETE  → No permitido
 *
 * ---------------------------------------------------------
 * TABLA: pricing_plans
 * ---------------------------------------------------------
 * SELECT  → Público
 * INSERT  → No permitido
 * UPDATE  → No permitido
 * DELETE  → No permitido
 *
 * ---------------------------------------------------------
 * NOTAS DE SEGURIDAD
 * ---------------------------------------------------------
 * - Las columnas user_id NUNCA deben ser nullable en tablas
 *   protegidas por RLS basado en auth.uid().
 * - Los INSERT públicos (orders) no exponen datos de otros
 *   usuarios; solo el propietario puede leer pedidos.
 * - Siempre usar auth.uid() en WITH CHECK para INSERT y
 *   USING para SELECT/UPDATE/DELETE.
 */
