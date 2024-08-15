export const migrateArr: string[] = [
  `
create table assets (
  id uuid primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  color text,
  icon text,
  tags text[0]
);

create table liability (
  id uuid primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  color text,
  icon text,
  tags text[0]
);

create table expense (
  id uuid primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  color text,
  icon text,
  tags text[0]
);

create table income (
  id uuid primary key,
  created_at timestamp with time zone default now(),
  name text not null,
  color text,
  icon text,
  tags text[0]
);

create table transaction (
  id bigint primary key generated always as identity,
  name text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  color text,
  icon text,
  type int,
  source_account_id uuid,
  destination_account_id uuid,
  amount numeric not null,
  foreign key (source_account_id) references assets (id),
  foreign key (source_account_id) references liability (id),
  foreign key (source_account_id) references expense (id),
  foreign key (source_account_id) references income (id),
  foreign key (destination_account_id) references assets (id),
  foreign key (destination_account_id) references liability (id),
  foreign key (destination_account_id) references expense (id),
  foreign key (destination_account_id) references income (id)
);
`,
  `alter table transaction add column source text;`,
  ``,
];
