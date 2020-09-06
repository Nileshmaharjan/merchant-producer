CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create table IF NOT EXISTS "MerchantGroup"
(
    id                       serial                          not null
        constraint "MerchantGroup_pkey"
            primary key,
    idx                      uuid default uuid_generate_v1() not null
        constraint "MerchantGroup_idx_key"
            unique,
    username                 text,
    password                 text,
    group_name               text                            not null,
    created_by               uuid                            not null,
    is_obsolete boolean NOT NULL default false,
    is_active boolean NOT NULL default true,
    created_on timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_on timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

alter table "MerchantGroup"
    owner to postgres;
    

create table IF NOT EXISTS "MerchantGroupTemp"
(
    id                       serial                          not null
        constraint "MerchantGroupTemp_pkey"
            primary key,
    idx                      uuid default uuid_generate_v1() not null
        constraint "MerchantGroupTemp_idx_key"
            unique,
    merchant_group_id        bigint,
    username                 text,
    password                 text,
    group_name               text                            not null,
    created_by               uuid                            not null,
    status                   text                            not null,
    rejection_reason         text,
    operation                text                            not null,
    approved_by              text,
    is_obsolete boolean NOT NULL default false,
    is_active boolean NOT NULL default true,
    created_on timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_on timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_merchant_group_id" FOREIGN KEY (merchant_group_id )
        REFERENCES public."MerchantGroup" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
    
)
WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;

alter table "MerchantGroupTemp"
    owner to postgres;


create table IF NOT EXISTS "MerchantProfile"
(
    id                       serial                          not null
        constraint "MerchantProfile_pkey"
            primary key,
    idx                      uuid default uuid_generate_v1() not null
        constraint "MerchantProfile_idx_key"
            unique,
    mobile_number            text                            not null,
    company_name             text                            not null,
    issue_date               date,
    merchant_code            text                                    ,
    id_type                  text,
    id_expiry                date,
    merchant_group_id        bigint,
    nationality              text                            not null,
    idpassport_no            text,
    establishment_licence_no text                            not null,
    tax_code                 text                            not null,
    company_website          text,
    email                    text,
    phone_number             text                            not null,
    bank_swift_code          text                            not null,
    bank_account_no          text                            not null,
    branch_code              text                            not null,
    bank_address             text                            not null,
    bank_code                text,
    sweep_interval           bigint                          not null,
    refund_allowed_days      bigint                          not null,
    merchant_nature          text                            not null,
    is_blocked               boolean                         default false,
    is_initiated             boolean                         default false,
    is_security_set          boolean                         default false,
    created_by               uuid                            not null,
    is_obsolete boolean NOT NULL default false,
    is_active boolean NOT NULL default true,
    created_on timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_on timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
     CONSTRAINT "fk_merchant_group" FOREIGN KEY (merchant_group_id)
        REFERENCES public."MerchantGroup" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

alter table "MerchantProfile"
    owner to postgres;



create table IF NOT EXISTS "MerchantProfileTemp"
(
    id                       serial                          not null
        constraint "MerchantProfileTemp_pkey"
            primary key,
    idx                      uuid default uuid_generate_v1() not null
        constraint "MerchantProfileTemp_idx_key"
            unique,
    merchant_id              bigint,
    mobile_number            text                     ,
    company_name             text                       ,
    issue_date               date,
    merchant_code            text,
    id_type                  text,
    id_expiry                date,
    merchant_group_id           bigint,
    nationality              text                   ,
    idpassport_no            text,
    establishment_licence_no text                 ,
    tax_code                 text                  ,
    company_website          text,
    email                    text,
    phone_number             text               ,
    bank_swift_code          text                ,
    bank_account_no          text                 ,
    branch_code              text                 ,
    bank_address             text                ,
    bank_code                text,
    sweep_interval           bigint               ,
    refund_allowed_days      bigint              ,
    merchant_nature          text                            not null,
    rejection_reason         text,
    is_blocked               boolean                         default false,
    created_by               uuid,
    approved_by              text,                 
    status                   text                            not null,
    operation                text                            not null,
    is_obsolete boolean NOT NULL default false,
    is_active boolean NOT NULL default true,
    created_on timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_on timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
     CONSTRAINT "fk_merchant_id" FOREIGN KEY (merchant_id)
        REFERENCES public."MerchantProfile" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT "fk_merchant_group" FOREIGN KEY (merchant_group_id)
        REFERENCES public."MerchantGroup" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

alter table "MerchantProfileTemp"
    owner to postgres;


create table IF NOT EXISTS "MerchantDevice"
(
    id                       serial                          not null
        constraint "MerchantDevice_pkey"
            primary key,
    idx                      uuid default uuid_generate_v1() not null
        constraint "MerchantDevice_idx_key"
            unique,
    merchant_id              bigint                          NOT NULL,
    phone_ext                text                            not null,
    mobile_number            text                            not null,
    phone_brand              text,                             
    phone_os                 text,                        
    os_version               text,                          
    deviceid                 text                            not null,
    otp                      text                            not null,
    fcm_token                text                            null,
    otp_type                 text,
    otp_status boolean not null default false,
    total_attempt bigint default 0,
    is_obsolete boolean NOT NULL default false,
    otp_created_at timestamp without time zone NOT NULL,
    created_on timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_on timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

alter table "MerchantDevice"
    owner to postgres;


create table IF NOT EXISTS "MerchantSecurityQuestion"
(
    id                       serial                          not null
        constraint "MerchantSecurityQuestion_pkey"
            primary key,
    idx                      uuid default uuid_generate_v1() not null
        constraint "MerchantSecurityQuestion_idx_key"
            unique,
    questions                 text                           not null,
    created_by text default 'Superadmin',                     
    is_obsolete boolean NOT NULL default false,
    is_active boolean NOT NULL default true,
    created_on timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_on timestamp without time zone DEFAULT CURRENT_TIMESTAMP
)
WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;


create table IF NOT EXISTS "MerchantAnswers"
(
    id                       serial                          not null
        constraint "MerchantAnswers_pkey"
            primary key,
    idx                      uuid default uuid_generate_v1() not null
        constraint "MerchantAnswers_idx_key"
            unique,
    merchant_id bigint not null,
    question_id                 SMALLINT                     not null,
    answer text not null,               
    is_obsolete boolean NOT NULL default false,
    is_active boolean NOT NULL default true,
    created_on timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_on timestamp without time zone DEFAULT CURRENT_TIMESTAMP
)
WITH (
        OIDS = FALSE
    )
    TABLESPACE pg_default;




