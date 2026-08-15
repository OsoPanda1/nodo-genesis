-- RPC function for atomic point redemption (prevents race conditions)
create or replace function redeem_points(p_user_id uuid, p_cost int)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_balance int;
  v_updated jsonb;
begin
  select puntos into v_balance
  from mineral_balances
  where user_id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('error', 'No balance found');
  end if;

  if v_balance < p_cost then
    return jsonb_build_object('error', 'Insufficient points');
  end if;

  update mineral_balances
  set puntos = puntos - p_cost
  where user_id = p_user_id
  returning to_jsonb(mineral_balances.*) into v_updated;

  return jsonb_build_object('success', true, 'balance', v_updated);
end;
$$;
