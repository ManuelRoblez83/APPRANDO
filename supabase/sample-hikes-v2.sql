-- Script pour insérer 20 randonnées d'exemple (Version 2)
-- IMPORTANT: Ce script associe automatiquement les randonnées au premier utilisateur trouvé
-- Si vous avez plusieurs utilisateurs, modifiez la requête SELECT ci-dessous

-- Option 1: Trouver automatiquement votre user_id (utilise le premier utilisateur)
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Récupère le premier utilisateur (le plus récent)
  SELECT id INTO target_user_id FROM auth.users ORDER BY created_at DESC LIMIT 1;
  
  -- Si aucun utilisateur trouvé, on arrête
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Aucun utilisateur trouvé. Veuillez créer un compte dans l''application d''abord.';
  END IF;

  -- Afficher l'UUID utilisé (pour vérification)
  RAISE NOTICE 'Utilisation de l''utilisateur avec UUID: %', target_user_id;

  -- Insérer 20 randonnées
  INSERT INTO hikes (user_id, name, date, start_location, end_location, distance, duration, start_coords, end_coords, elevation_profile, created_at, updated_at) VALUES
    (target_user_id, 'Tour du Mont-Blanc - Étape 1 : Chamonix - Les Contamines', '2024-06-15', 'Chamonix-Mont-Blanc', 'Les Contamines-Montjoie', 16.5, '5h 30m', '{"lat": 45.9237, "lng": 6.8694}', '{"lat": 45.8194, "lng": 6.7186}', '{"minElevation": 1050, "maxElevation": 1717, "totalAscent": 667, "totalDescent": 500}', NOW(), NOW()),
    (target_user_id, 'GR34 - Cap Fréhel à Fort la Latte', '2024-05-20', 'Cap Fréhel', 'Fort la Latte', 8.2, '2h 45m', '{"lat": 48.6847, "lng": -2.3167}', '{"lat": 48.6708, "lng": -2.2858}', '{"minElevation": 0, "maxElevation": 70, "totalAscent": 250, "totalDescent": 180}', NOW(), NOW()),
    (target_user_id, 'GR70 - Le Monastier à Pradelles', '2024-07-10', 'Le Monastier-sur-Gazeille', 'Pradelles', 22.0, '7h 15m', '{"lat": 44.9386, "lng": 4.0031}', '{"lat": 44.7697, "lng": 3.8831}', '{"minElevation": 850, "maxElevation": 1385, "totalAscent": 850, "totalDescent": 315}', NOW(), NOW()),
    (target_user_id, 'Sentier Blanc-Martel - Gorges du Verdon', '2024-08-05', 'La Palud-sur-Verdon', 'Point Sublime', 13.5, '6h 00m', '{"lat": 43.9158, "lng": 6.3425}', '{"lat": 43.9056, "lng": 6.3953}', '{"minElevation": 450, "maxElevation": 950, "totalAscent": 500, "totalDescent": 500}', NOW(), NOW()),
    (target_user_id, 'GR65 - Saint-Jean-Pied-de-Port à Roncevaux', '2024-09-01', 'Saint-Jean-Pied-de-Port', 'Roncevaux', 25.0, '8h 30m', '{"lat": 43.1639, "lng": -1.2375}', '{"lat": 43.0133, "lng": -1.3197}', '{"minElevation": 180, "maxElevation": 1430, "totalAscent": 1250, "totalDescent": 0}', NOW(), NOW()),
    (target_user_id, 'Calanque de Sormiou à Calanque de Morgiou', '2024-06-25', 'Calanque de Sormiou', 'Calanque de Morgiou', 6.8, '2h 20m', '{"lat": 43.2164, "lng": 5.4031}', '{"lat": 43.2086, "lng": 5.4358}', '{"minElevation": 0, "maxElevation": 200, "totalAscent": 350, "totalDescent": 350}', NOW(), NOW()),
    (target_user_id, 'GR5 - Le Hohneck au Grand Ballon', '2024-07-18', 'Hohneck', 'Grand Ballon', 18.5, '6h 00m', '{"lat": 48.0375, "lng": 7.0181}', '{"lat": 47.9014, "lng": 7.1003}', '{"minElevation": 1180, "maxElevation": 1424, "totalAscent": 600, "totalDescent": 356}', NOW(), NOW()),
    (target_user_id, 'GR65 - Rocamadour à Cahors', '2024-05-12', 'Rocamadour', 'Cahors', 32.0, '9h 30m', '{"lat": 44.7994, "lng": 1.6189}', '{"lat": 44.4486, "lng": 1.4347}', '{"minElevation": 110, "maxElevation": 420, "totalAscent": 650, "totalDescent": 520}', NOW(), NOW()),
    (target_user_id, 'Toulouse à Montgiscard le long du Canal du Midi', '2024-04-30', 'Toulouse', 'Montgiscard', 15.0, '4h 00m', '{"lat": 43.6047, "lng": 1.4442}', '{"lat": 43.4625, "lng": 1.5792}', '{"minElevation": 130, "maxElevation": 180, "totalAscent": 50, "totalDescent": 0}', NOW(), NOW()),
    (target_user_id, 'Ascension du Puy de Dôme', '2024-08-20', 'Col de Ceyssat', 'Sommet du Puy de Dôme', 5.5, '2h 15m', '{"lat": 45.7781, "lng": 2.9397}', '{"lat": 45.7725, "lng": 2.9644}', '{"minElevation": 1050, "maxElevation": 1465, "totalAscent": 415, "totalDescent": 0}', NOW(), NOW()),
    (target_user_id, 'GR11 - Tour de la Forêt de Fontainebleau', '2024-05-08', 'Barbizon', 'Fontainebleau', 12.5, '3h 45m', '{"lat": 48.4458, "lng": 2.6028}', '{"lat": 48.4075, "lng": 2.7028}', '{"minElevation": 65, "maxElevation": 140, "totalAscent": 200, "totalDescent": 125}', NOW(), NOW()),
    (target_user_id, 'Traversée de la Baie du Mont-Saint-Michel', '2024-06-30', 'Genêts', 'Mont-Saint-Michel', 10.0, '3h 30m', '{"lat": 48.6844, "lng": -1.4758}', '{"lat": 48.6358, "lng": -1.5114}', '{"minElevation": 0, "maxElevation": 0, "totalAscent": 0, "totalDescent": 0}', NOW(), NOW()),
    (target_user_id, 'GR5 - Mouthe à Métabief', '2024-07-22', 'Mouthe', 'Métabief', 20.0, '6h 45m', '{"lat": 46.7125, "lng": 6.1931}', '{"lat": 46.7711, "lng": 6.3358}', '{"minElevation": 950, "maxElevation": 1460, "totalAscent": 700, "totalDescent": 190}', NOW(), NOW()),
    (target_user_id, 'GR20 - Calenzana à Bonifatu', '2024-09-10', 'Calenzana', 'Bonifatu', 14.0, '5h 00m', '{"lat": 42.5072, "lng": 8.8553}', '{"lat": 42.5797, "lng": 8.8625}', '{"minElevation": 140, "maxElevation": 1250, "totalAscent": 1110, "totalDescent": 0}', NOW(), NOW()),
    (target_user_id, 'Lac d''Allos via le Col de la Petite Cayolle', '2024-08-15', 'Colmars-les-Alpes', 'Lac d''Allos', 17.5, '6h 30m', '{"lat": 44.1778, "lng": 6.6261}', '{"lat": 44.2397, "lng": 6.6972}', '{"minElevation": 1420, "maxElevation": 2227, "totalAscent": 807, "totalDescent": 0}', NOW(), NOW()),
    (target_user_id, 'Château de Chambord à Blois', '2024-04-15', 'Chambord', 'Blois', 18.0, '4h 30m', '{"lat": 47.6147, "lng": 1.5169}', '{"lat": 47.5867, "lng": 1.3322}', '{"minElevation": 70, "maxElevation": 110, "totalAscent": 80, "totalDescent": 40}', NOW(), NOW()),
    (target_user_id, 'Gavarnie au Cirque et à la Brèche de Roland', '2024-08-25', 'Gavarnie', 'Brèche de Roland', 22.0, '9h 00m', '{"lat": 42.7333, "lng": -0.0167}', '{"lat": 42.6933, "lng": -0.0150}', '{"minElevation": 1365, "maxElevation": 2807, "totalAscent": 1442, "totalDescent": 0}', NOW(), NOW()),
    (target_user_id, 'GR4 - Meymac à Ussel', '2024-06-05', 'Meymac', 'Ussel', 19.0, '5h 45m', '{"lat": 45.5350, "lng": 2.1461}', '{"lat": 45.5486, "lng": 2.3103}', '{"minElevation": 680, "maxElevation": 950, "totalAscent": 420, "totalDescent": 150}', NOW(), NOW()),
    (target_user_id, 'Pic de l''Ours dans le Massif de l''Estérel', '2024-07-05', 'Théoule-sur-Mer', 'Pic de l''Ours', 11.0, '4h 00m', '{"lat": 43.5067, "lng": 6.9417}', '{"lat": 43.4881, "lng": 6.8767}', '{"minElevation": 0, "maxElevation": 492, "totalAscent": 492, "totalDescent": 492}', NOW(), NOW()),
    (target_user_id, 'Tour du Lac d''Annecy', '2024-08-10', 'Annecy', 'Annecy', 40.0, '12h 00m', '{"lat": 45.8992, "lng": 6.1294}', '{"lat": 45.8992, "lng": 6.1294}', '{"minElevation": 446, "maxElevation": 510, "totalAscent": 200, "totalDescent": 200}', NOW(), NOW());

  RAISE NOTICE '20 randonnées d''exemple ont été insérées avec succès pour l''utilisateur % !', target_user_id;
END $$;










