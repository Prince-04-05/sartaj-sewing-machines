
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.enquiry_status AS ENUM ('new', 'contacted', 'visit_scheduled', 'closed');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- First account becomes admin
CREATE OR REPLACE FUNCTION public.assign_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created_assign_admin
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.assign_first_admin();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  group_name text NOT NULL DEFAULT 'Machines',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  short_description text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  features text[] NOT NULL DEFAULT '{}',
  specifications jsonb NOT NULL DEFAULT '[]'::jsonb,
  images text[] NOT NULL DEFAULT '{}',
  is_featured boolean NOT NULL DEFAULT false,
  is_best_seller boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON public.products(category_id);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published products" ON public.products FOR SELECT TO anon, authenticated
  USING (is_published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER products_touch BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Gallery
CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Machines',
  image_url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read gallery" ON public.gallery_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage gallery" ON public.gallery_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Banners
CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  eyebrow text NOT NULL DEFAULT '',
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  cta_label text NOT NULL DEFAULT 'Explore',
  cta_link text NOT NULL DEFAULT '/products',
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banners TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active banners" ON public.banners FOR SELECT TO anon, authenticated
  USING (is_active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage banners" ON public.banners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Testimonials
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL DEFAULT '',
  message text NOT NULL,
  rating int NOT NULL DEFAULT 5,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active testimonials" ON public.testimonials FOR SELECT TO anon, authenticated
  USING (is_active OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage testimonials" ON public.testimonials FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Site settings
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enquiries
CREATE TABLE public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT ('SRT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  city text NOT NULL DEFAULT '',
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL DEFAULT '',
  enquiry_type text NOT NULL DEFAULT 'Product Enquiry',
  message text NOT NULL DEFAULT '',
  status public.enquiry_status NOT NULL DEFAULT 'new',
  admin_notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX enquiries_created_idx ON public.enquiries(created_at DESC);
CREATE INDEX enquiries_phone_idx ON public.enquiries(phone, created_at DESC);
GRANT SELECT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read enquiries" ON public.enquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update enquiries" ON public.enquiries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete enquiries" ON public.enquiries FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER enquiries_touch BEFORE UPDATE ON public.enquiries FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Storage policies for media bucket (bucket created separately)
CREATE POLICY "Public read media" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'media');
CREATE POLICY "Admins upload media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

-- ===== SEED =====
INSERT INTO public.categories (slug, name, description, image_url, group_name, sort_order) VALUES
('domestic-sewing-machines','Domestic Sewing Machines','Reliable home machines for families, students and boutique tailoring.','/images/domestic-machine.jpg','Machines',1),
('industrial-sewing-machines','Industrial Sewing Machines','High-speed workhorses for garment units and professional tailors.','/images/industrial-machine.jpg','Machines',2),
('manual-foot-pedal-machines','Manual / Foot Pedal Machines','Classic treadle machines built to last generations — no electricity needed.','/images/manual-machine.jpg','Machines',3),
('electric-sewing-machines','Electric Sewing Machines','Motorised convenience with smooth, controlled stitching.','/images/domestic-machine.jpg','Machines',4),
('single-needle-machines','Single Needle Machines','Precise lockstitch for straight seams on every fabric.','/images/industrial-machine.jpg','Machines',5),
('double-needle-machines','Double Needle Machines','Parallel stitching for jeans, shirts and decorative seams.','/images/double-needle.jpg','Machines',6),
('overlock-machines','Overlock Machines','Clean, professional edge finishing with 3, 4 and 5 thread options.','/images/overlock-machine.jpg','Machines',7),
('interlock-machines','Interlock Machines','Stretch-friendly flatlock and interlock for knitwear.','/images/interlock-machine.jpg','Machines',8),
('embroidery-machines','Embroidery Machines','Computerised embroidery for designs, monograms and logos.','/images/embroidery-machine.jpg','Machines',9),
('special-purpose-machines','Special Purpose Machines','Button hole, button stitch, bartack and more specialised machines.','/images/machine-head.jpg','Machines',10),
('sewing-machine-motors','Sewing Machine Motors','Clutch and universal motors for domestic and industrial use.','/images/servo-motor.jpg','Motors',11),
('servo-motors','Servo Motors','Energy-saving, silent servo motors with digital speed control.','/images/servo-motor.jpg','Motors',12),
('tables-and-stands','Tables and Stands','Sturdy industrial tables and stands for every machine.','/images/machine-table.jpg','Parts & Accessories',13),
('foot-pedals','Foot Pedals','Pedals and speed controllers for smooth operation.','/images/belts-pedal.jpg','Parts & Accessories',14),
('belts','Belts','V-belts and round belts in all standard sizes.','/images/belts-pedal.jpg','Parts & Accessories',15),
('needles','Needles','Domestic and industrial needles for every fabric weight.','/images/needles-accessories.jpg','Parts & Accessories',16),
('bobbins-and-bobbin-cases','Bobbins and Bobbin Cases','Genuine-fit bobbins and cases for smooth thread feed.','/images/spare-parts.jpg','Parts & Accessories',17),
('machine-heads','Machine Heads','Replacement and upgrade heads for industrial setups.','/images/machine-head.jpg','Parts & Accessories',18),
('spare-parts','Spare Parts','Presser feet, hooks, feed dogs, shuttles and more.','/images/spare-parts.jpg','Parts & Accessories',19),
('sewing-accessories','Sewing Accessories','Scissors, measuring tapes, threads, oil and tailoring essentials.','/images/needles-accessories.jpg','Parts & Accessories',20),
('other-products','Other Sewing Products','Everything else your sewing work needs — just ask us.','/images/showroom.jpg','Parts & Accessories',21);

INSERT INTO public.products (slug, name, category_id, short_description, description, features, specifications, images, is_featured, is_best_seller, sort_order)
SELECT p.slug, p.name, c.id, p.short_description, p.description, p.features, p.specifications::jsonb, p.images, p.is_featured, p.is_best_seller, p.sort_order
FROM (VALUES
('sartaj-classic-tailor-pro','SARTAJ Classic Tailor Pro','manual-foot-pedal-machines','The timeless black-and-gold tailoring machine on a cast iron treadle stand.','A dependable full-size tailoring machine trusted by generations of Punjab tailors. Heavy cast body, smooth hand wheel and precision feed make it ideal for daily stitching of suits, kurtas and household fabrics — with or without electricity.',ARRAY['Heavy-duty cast iron body','Works without electricity','Smooth straight stitch','Easy to maintain and repair','Optional motor fitting available'],'[{"label":"Type","value":"Manual / Treadle"},{"label":"Stitch","value":"Straight lockstitch"},{"label":"Body","value":"Cast iron, black with gold decals"},{"label":"Stand","value":"Cast iron treadle with wooden top"},{"label":"Warranty","value":"Shop service support"}]',ARRAY['/images/manual-machine.jpg','/images/showroom.jpg'],true,true,1),
('sartaj-industrial-lockstitch-x1','SARTAJ Industrial Lockstitch X1','industrial-sewing-machines','High-speed single needle lockstitch with silent servo motor and table.','Built for garment units and professional tailors who stitch all day. Direct-drive precision, automatic lubrication and a silent energy-saving servo motor deliver clean seams at high speed.',ARRAY['Up to 5000 stitches per minute','Silent energy-saving servo motor','Automatic oil lubrication','Complete table and stand included','LED work light'],'[{"label":"Type","value":"Industrial single needle lockstitch"},{"label":"Max speed","value":"5000 SPM"},{"label":"Stitch length","value":"Up to 5 mm"},{"label":"Motor","value":"550W servo"},{"label":"Fabric","value":"Light to medium-heavy"}]',ARRAY['/images/industrial-machine.jpg','/images/servo-motor.jpg','/images/machine-table.jpg'],true,true,2),
('sartaj-home-smart-electric','SARTAJ Home Smart Electric','domestic-sewing-machines','Computerised home machine with LCD display and multiple stitch patterns.','A modern home sewing machine that makes stitching, alterations and craft work effortless. Choose from built-in stitch patterns at the touch of a button.',ARRAY['LCD display with pattern selection','Automatic needle threader','One-step buttonhole','Speed control slider','Lightweight and portable'],'[{"label":"Type","value":"Computerised domestic"},{"label":"Stitch patterns","value":"Multiple built-in"},{"label":"Buttonhole","value":"One-step automatic"},{"label":"Power","value":"220V AC"}]',ARRAY['/images/domestic-machine.jpg','/images/needles-accessories.jpg'],true,false,3),
('sartaj-overlock-4-thread','SARTAJ Overlock 4-Thread','overlock-machines','Professional 4-thread overlock for clean, durable edge finishing.','Give every garment a factory-perfect finish. This 4-thread overlock trims, stitches and finishes edges in a single pass, perfect for boutiques and garment units.',ARRAY['4-thread overlock stitch','Differential feed','Built-in trimming knife','High speed operation','Easy colour-coded threading'],'[{"label":"Type","value":"Overlock / Serger"},{"label":"Threads","value":"4"},{"label":"Max speed","value":"6000 SPM"},{"label":"Feed","value":"Differential"}]',ARRAY['/images/overlock-machine.jpg','/images/industrial-machine.jpg'],true,true,4),
('sartaj-embroidery-studio','SARTAJ Embroidery Studio','embroidery-machines','Computerised embroidery machine with colour touchscreen and hoops.','Create beautiful embroidery, monograms and logos with ease. Load designs, select colours on the touchscreen, and let the machine stitch with precision.',ARRAY['Colour touchscreen','Built-in embroidery designs','Multiple hoop sizes','USB design import','Automatic thread cutter'],'[{"label":"Type","value":"Computerised embroidery"},{"label":"Display","value":"Colour touchscreen"},{"label":"Design import","value":"USB"},{"label":"Hoops","value":"Multiple sizes"}]',ARRAY['/images/embroidery-machine.jpg','/images/domestic-machine.jpg'],true,false,5),
('sartaj-servo-motor-550w','SARTAJ Servo Motor 550W','servo-motors','Silent, energy-saving servo motor with digital speed display.','Upgrade any industrial machine with this silent servo motor. Saves up to 70% electricity versus clutch motors with precise digital speed control.',ARRAY['Up to 70% power saving','Near-silent operation','Digital speed display','Needle position control','Fits most industrial machines'],'[{"label":"Power","value":"550W"},{"label":"Voltage","value":"220V"},{"label":"Speed range","value":"200–5000 RPM"},{"label":"Display","value":"Digital LED"}]',ARRAY['/images/servo-motor.jpg','/images/industrial-machine.jpg'],true,true,6),
('sartaj-double-needle-pro','SARTAJ Double Needle Pro','double-needle-machines','Twin-needle industrial machine for parallel seams on denim and shirts.','Perfect for jeans, shirts and uniforms. Two needles stitch perfectly parallel lines for strong, decorative seams.',ARRAY['Twin parallel needles','Heavy fabric capable','Adjustable needle gauge','Automatic lubrication'],'[{"label":"Type","value":"Industrial double needle"},{"label":"Needle gauge","value":"Interchangeable"},{"label":"Max speed","value":"3000 SPM"}]',ARRAY['/images/double-needle.jpg','/images/industrial-machine.jpg'],false,false,7),
('sartaj-interlock-flatlock','SARTAJ Interlock Flatlock','interlock-machines','Flatlock / interlock machine for knitwear, T-shirts and sportswear.','Stretchy, flat, comfortable seams for knit fabrics. Ideal for hosiery and sportswear manufacturers.',ARRAY['Flatlock cover stitch','Stretch-friendly seams','Cylinder bed option','Smooth differential feed'],'[{"label":"Type","value":"Interlock / Flatlock"},{"label":"Needles","value":"3"},{"label":"Max speed","value":"5500 SPM"}]',ARRAY['/images/interlock-machine.jpg','/images/overlock-machine.jpg'],false,true,8),
('sartaj-electric-tailor','SARTAJ Electric Tailor','electric-sewing-machines','Classic tailoring machine fitted with motor and speed pedal.','All the strength of a classic tailoring machine, with the convenience of a motor and foot speed control.',ARRAY['Pre-fitted motor','Foot speed controller','Strong cast body','Work light'],'[{"label":"Type","value":"Electric tailoring"},{"label":"Motor","value":"Universal motor"},{"label":"Control","value":"Foot pedal"}]',ARRAY['/images/manual-machine.jpg','/images/belts-pedal.jpg'],false,false,9),
('sartaj-industrial-table-stand','SARTAJ Industrial Table & Stand','tables-and-stands','Heavy-duty steel stand with laminated top for industrial machines.','A rigid, vibration-free table and stand that fits standard industrial heads. Adjustable height and levelling feet.',ARRAY['Powder-coated steel frame','Laminated wooden top','Adjustable height','Levelling feet'],'[{"label":"Frame","value":"Powder-coated steel"},{"label":"Top","value":"Laminated board"},{"label":"Fits","value":"Standard industrial heads"}]',ARRAY['/images/machine-table.jpg','/images/industrial-machine.jpg'],false,false,10),
('sartaj-bobbin-case-set','SARTAJ Bobbin & Bobbin Case Set','bobbins-and-bobbin-cases','Precision bobbins and bobbin cases for domestic and industrial machines.','Smooth, consistent thread tension starts with the right bobbin. Available for most domestic and industrial models.',ARRAY['Precision machined','Smooth tension','Domestic & industrial sizes','Rust resistant'],'[{"label":"Material","value":"Steel"},{"label":"Compatibility","value":"Most models — ask us"}]',ARRAY['/images/spare-parts.jpg','/images/needles-accessories.jpg'],false,true,11),
('sartaj-needle-assortment','SARTAJ Needle Assortment','needles','Needles for every fabric: cotton, silk, denim, leather and knits.','The right needle makes all the difference. We stock domestic and industrial needles in every common size.',ARRAY['All common sizes','Domestic & industrial','Ball point & sharp','Bulk packs available'],'[{"label":"Sizes","value":"9 to 23"},{"label":"Types","value":"Domestic, industrial, ball point"}]',ARRAY['/images/needles-accessories.jpg','/images/spare-parts.jpg'],false,false,12),
('sartaj-belts-and-pedals','SARTAJ Belts & Foot Pedals','foot-pedals','Replacement V-belts, round belts and foot pedals.','Keep your machine running smoothly with fresh belts and responsive pedals. All standard sizes in stock.',ARRAY['All standard belt sizes','Durable rubber construction','Electric and treadle pedals'],'[{"label":"Belts","value":"V-belt, round belt"},{"label":"Pedals","value":"Electric speed control, treadle"}]',ARRAY['/images/belts-pedal.jpg','/images/servo-motor.jpg'],false,false,13),
('sartaj-spare-parts-kit','SARTAJ Spare Parts Kit','spare-parts','Presser feet, hooks, feed dogs, shuttles and essential spare parts.','Genuine-fit spare parts for domestic and industrial machines. Bring your old part to the shop and we will match it.',ARRAY['Presser feet','Rotary hooks & shuttles','Feed dogs & needle plates','Springs & screws'],'[{"label":"Compatibility","value":"Domestic & industrial"},{"label":"Matching","value":"Bring sample part to shop"}]',ARRAY['/images/spare-parts.jpg','/images/repair-service.jpg'],false,true,14),
('sartaj-industrial-machine-head','SARTAJ Industrial Machine Head','machine-heads','Replacement industrial lockstitch head for existing tables.','Upgrade or replace your industrial head without changing your table setup.',ARRAY['Standard mounting','High speed','Auto lubrication'],'[{"label":"Type","value":"Lockstitch head"},{"label":"Mounting","value":"Standard industrial"}]',ARRAY['/images/machine-head.jpg','/images/industrial-machine.jpg'],false,false,15),
('sartaj-tailoring-essentials','SARTAJ Tailoring Essentials','sewing-accessories','Scissors, tapes, threads, machine oil and daily tailoring tools.','Everything a tailor needs on the work table — quality tools at our shop.',ARRAY['Tailoring scissors','Measuring tapes','Thread spools & cones','Machine oil'],'[{"label":"Includes","value":"Scissors, tapes, threads, oil"}]',ARRAY['/images/needles-accessories.jpg','/images/spare-parts.jpg'],false,false,16)
) AS p(slug,name,cat_slug,short_description,description,features,specifications,images,is_featured,is_best_seller,sort_order)
JOIN public.categories c ON c.slug = p.cat_slug;

INSERT INTO public.gallery_images (title, category, image_url, sort_order) VALUES
('The SARTAJ showroom','Showroom','/images/showroom.jpg',1),
('Industrial lockstitch','Machines','/images/industrial-machine.jpg',2),
('Classic tailoring machine','Machines','/images/manual-machine.jpg',3),
('Expert repair bench','Repair & Service','/images/repair-service.jpg',4),
('Servo motors','Motors & Parts','/images/servo-motor.jpg',5),
('Overlock finishing','Machines','/images/overlock-machine.jpg',6),
('Spare parts counter','Motors & Parts','/images/spare-parts.jpg',7),
('Embroidery machine','Machines','/images/embroidery-machine.jpg',8),
('Home sewing machine','Machines','/images/domestic-machine.jpg',9),
('Needles & accessories','Collections','/images/needles-accessories.jpg',10),
('Industrial table setup','Collections','/images/machine-table.jpg',11),
('Interlock machine','Machines','/images/interlock-machine.jpg',12),
('Belts & pedals','Motors & Parts','/images/belts-pedal.jpg',13),
('Double needle machine','Machines','/images/double-needle.jpg',14),
('Machine heads','Collections','/images/machine-head.jpg',15),
('Signature SARTAJ machine','Collections','/images/hero-machine.jpg',16);

INSERT INTO public.banners (eyebrow, title, subtitle, image_url, cta_label, cta_link, sort_order) VALUES
('Industrial Range','Built for all-day stitching','High-speed lockstitch, overlock and interlock machines with silent servo motors.','/images/industrial-machine.jpg','Explore Industrial','/products',1),
('Repair & Service','Expert care for every machine','Doorstep-quality repair, servicing and genuine spare parts at our Hariana shop.','/images/repair-service.jpg','Book a Service','/services',2),
('Motors & Parts','Save power with servo motors','Upgrade to a silent energy-saving servo motor — fitted at our shop.','/images/servo-motor.jpg','View Motors','/products',3);

INSERT INTO public.testimonials (name, location, message, rating, sort_order) VALUES
('Gurpreet Singh','Hoshiarpur','Bought two industrial machines for my boutique. Sartaj set them up perfectly and the after-sales service is excellent.',5,1),
('Harjit Kaur','Hariana','My old tailoring machine was repaired in one day. Honest advice and fair dealing — highly recommended.',5,2),
('Rajesh Kumar','Dasuya','Upgraded to a servo motor here. Silent, smooth and my electricity bill has dropped. Great guidance.',5,3),
('Simran Bains','Garhshankar','Found every spare part I needed in one place. The team knows their machines very well.',5,4);

INSERT INTO public.site_settings (key, value) VALUES
('contact', '{"phone":"9855457616","whatsapp":"9878211338","email":"mrprince110022@gmail.com","address":"Hariana, Punjab, India","mapsUrl":"https://maps.app.goo.gl/GkMM8mitAMxYkAJT6","lat":31.6387333,"lng":75.8414912,"hours":"Mon – Sat: 9:00 AM – 8:00 PM","instagram":"","facebook":"","youtube":""}'::jsonb),
('content', '{"announcement":"Visit our Hariana showroom — expert advice, genuine parts and trusted repair service.","heroEyebrow":"Hariana · Punjab","heroTitle":"The crown of fine stitching.","heroSubtitle":"Premium domestic & industrial sewing machines, motors, spare parts and expert repair — chosen and serviced by people who know machines.","aboutTitle":"Trusted by tailors across Punjab","aboutBody":"SARTAJ is a sewing machine specialist in Hariana, Punjab. From classic tailoring machines to high-speed industrial setups, servo motors and every small spare part, we help home tailors, boutiques and garment units choose the right machine — and keep it running for years."}'::jsonb);
