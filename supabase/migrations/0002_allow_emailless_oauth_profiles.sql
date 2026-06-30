alter table public.profiles
alter column email drop not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_email citext := nullif(new.email, '')::citext;
  profile_nickname text := nullif(
    coalesce(
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'user_name',
      new.raw_user_meta_data->>'nickname',
      case
        when profile_email is not null then split_part(profile_email::text, '@', 1)
        else null
      end,
      '사용자'
    ),
    ''
  );
  profile_image_url text := nullif(
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    ),
    ''
  );
begin
  insert into public.profiles (id, email, nickname, profile_image)
  values (
    new.id,
    profile_email,
    profile_nickname,
    profile_image_url
  )
  on conflict (id) do update
  set email = coalesce(excluded.email, public.profiles.email),
      nickname = coalesce(public.profiles.nickname, excluded.nickname),
      profile_image = coalesce(public.profiles.profile_image, excluded.profile_image),
      updated_at = now();

  return new;
end;
$$;
