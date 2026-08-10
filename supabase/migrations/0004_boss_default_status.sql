-- 给所有没有 status 字段的 boss 补上 status='active'
-- 修复 seed 漏写 status 导致页面 filter 看不到的问题
update settings
set bosses = (
  select coalesce(jsonb_agg(
    case
      when b ? 'status' then b
      else b || jsonb_build_object('status', 'active')
    end
  ), '[]'::jsonb)
  from jsonb_array_elements(coalesce(bosses, '[]'::jsonb)) as b
),
updated_at = now()
where id = 1
  and bosses is not null
  and jsonb_array_length(bosses) > 0;
