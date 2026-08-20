# Política de Seguridad

## Reportar Vulnerabilidades de Seguridad

**NO** reportes vulnerabilidades de seguridad a través de GitHub Issues públicas.

Por favor, reporta las vulnerabilidades de seguridad enviando un email privado a:

📧 **[maintainer@example.com]**

Incluye la siguiente información en tu reporte:

1. **Descripción:** Qué es la vulnerabilidad
2. **Impacto:** Cómo afecta a la seguridad
3. **Pasos para Reproducir:** Cómo se puede explotar
4. **Versión Afectada:** Qué versión(es) tienen el problema
5. **Solución Propuesta:** Si tienes una (opcional)

## Política de Divulgación Responsable

- Nos esforzaremos por responder en **48 horas**
- Trabajaremos en un fix y lo haremos público en un patch
- Te acreditaremos en el CHANGELOG (si lo deseas)
- Esperamos que no divulgues el problema hasta que hayamos publicado el fix

## Áreas de Seguridad Crítica

### 1. Validación de Scores (Anti-Trampa)

El sistema de validación de scores es crítico. Los siguientes cambios requieren especial cuidado:

- `supabase/functions/_shared/validateEnergy.ts`
- `apps/web/src/lib/score-validation.ts` (si existe)
- Edge Function `submit-score`

### 2. Autenticación y Autorización

- Variables de entorno: `SUPABASE_SERVICE_ROLE_KEY` nunca al cliente
- RLS policies en Postgres
- JWT validation en Edge Functions

### 3. Datos Sensibles

- No commitear `.env.local` ni secrets
- No exponer tokens de API en logs de cliente
- Usar `NEXT_PUBLIC_` solo para datos públicos

## Dependencias Vulnerables

Escaneamos regularmente con:

```bash
pnpm audit
npm audit (para Node)
```

Si encuentras una vulnerabilidad en una dependencia:

1. Abre un issue privado (si es posible)
2. O envía un email al equipo de mantenimiento
3. Incluye:
   - Nombre y versión del paquete
   - CVE o referencia de seguridad
   - Recomendación de versión

## Buenas Prácticas de Seguridad para Contribuidores

- ✅ Siempre revisa logs y no commits datos sensibles
- ✅ Usa `git-secrets` o similares para prevenir secrets
- ✅ Valida inputs en Edge Functions (nunca confíes en el cliente)
- ✅ Usa HTTPS para todas las conexiones
- ✅ Mantén dependencias actualizado: `pnpm update --latest`
- ✅ Revisa cambios de permisos en RLS policies

---

## Vulnerabilidades Conocidas

(Si las hay, listarlas aquí con CVE y status de fix)

---

**Gracias por ayudarnos a mantener Qura and Friends seguro.** 🔒
