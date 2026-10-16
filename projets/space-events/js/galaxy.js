// Animated spiral galaxy drawn on a fixed canvas behind the page content
(function () {
    const canvas = document.getElementById("galaxy-background");

    if (!canvas) {
        return;
    }

    const context = canvas.getContext("2d");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ARM_COUNT = 3;
    const GALAXY_STAR_COUNT = 6000;
    const NEBULA_CLOUD_COUNT = 220;
    const BACKGROUND_STAR_COUNT = 400;
    const ARM_TWIST = 3.2;          // How tightly the arms wind around the core
    const TILT = 0.55;              // Vertical squash so the galaxy looks inclined
    const ROTATION_SPEED = 0.00004; // Radians per millisecond

    let width = 0;
    let height = 0;
    let galaxyStars = [];
    let nebulaClouds = [];
    let backgroundStars = [];

    function random(min, max) {
        return min + Math.random() * (max - min);
    }

    // Pre-rendered soft glow, reused for every nebula cloud (much faster than a gradient per cloud)
    function createGlowSprite(red, green, blue) {
        const sprite = document.createElement("canvas");
        const size = 64;
        sprite.width = size;
        sprite.height = size;

        const spriteContext = sprite.getContext("2d");
        const gradient = spriteContext.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, 1)`);
        gradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
        spriteContext.fillStyle = gradient;
        spriteContext.fillRect(0, 0, size, size);

        return sprite;
    }

    const glowSprites = [
        createGlowSprite(120, 90, 255),  // Violet
        createGlowSprite(70, 150, 255),  // Blue
        createGlowSprite(255, 110, 200)  // Pink
    ];

    // Position of a point on a spiral arm
    function armAngle(arm, distanceRatio, spread) {
        return (arm / ARM_COUNT) * Math.PI * 2 + distanceRatio * ARM_TWIST + spread;
    }

    // Stars near the core are warm and bright, outer stars are blue/violet
    function starColor(distanceRatio) {
        if (distanceRatio < 0.15) {
            return `rgba(255, 236, 200, ${random(0.6, 1)})`;
        }

        const hue = random(200, 280);
        return `hsla(${hue}, 80%, ${random(65, 90)}%, ${random(0.35, 0.9)})`;
    }

    function createStars() {
        galaxyStars = [];
        nebulaClouds = [];
        backgroundStars = [];

        for (let i = 0; i < GALAXY_STAR_COUNT; i++) {
            // Squaring the random value concentrates stars near the core
            const distanceRatio = Math.pow(Math.random(), 2);
            const spread = random(-0.5, 0.5) * (0.3 + distanceRatio);

            galaxyStars.push({
                distanceRatio,
                angle: armAngle(i % ARM_COUNT, distanceRatio, spread),
                size: distanceRatio < 0.15 ? random(1.2, 2.6) : random(0.7, 2),
                color: starColor(distanceRatio)
            });
        }

        // Soft colored clouds that trace the spiral arms
        for (let i = 0; i < NEBULA_CLOUD_COUNT; i++) {
            const distanceRatio = random(0.08, 0.9);

            nebulaClouds.push({
                distanceRatio,
                angle: armAngle(i % ARM_COUNT, distanceRatio, random(-0.25, 0.25)),
                size: random(40, 110) * (1 - distanceRatio * 0.5),
                alpha: random(0.05, 0.14),
                sprite: glowSprites[Math.floor(Math.random() * glowSprites.length)]
            });
        }

        for (let i = 0; i < BACKGROUND_STAR_COUNT; i++) {
            backgroundStars.push({
                x: Math.random(),
                y: Math.random(),
                size: random(0.3, 1.3),
                twinkleSpeed: random(0.0005, 0.002),
                twinkleOffset: random(0, Math.PI * 2)
            });
        }
    }

    function resize() {
        const pixelRatio = window.devicePixelRatio || 1;

        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = width * pixelRatio;
        canvas.height = height * pixelRatio;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        if (prefersReducedMotion) {
            draw(0);
        }
    }

    function draw(time) {
        const centerX = width / 2;
        const centerY = height / 2;
        const galaxyRadius = Math.max(width, height) * 0.55;
        const rotation = time * ROTATION_SPEED;

        // Deep space background
        context.globalCompositeOperation = "source-over";
        context.fillStyle = "#05060f";
        context.fillRect(0, 0, width, height);

        // Twinkling background stars
        backgroundStars.forEach((star) => {
            const alpha = 0.3 + 0.7 * Math.abs(Math.sin(time * star.twinkleSpeed + star.twinkleOffset));
            context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            context.fillRect(star.x * width, star.y * height, star.size, star.size);
        });

        // Additive blending makes overlapping stars glow
        context.globalCompositeOperation = "lighter";

        // Glowing core
        const coreGlow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, galaxyRadius * 0.35);
        coreGlow.addColorStop(0, "rgba(255, 225, 190, 0.7)");
        coreGlow.addColorStop(0.25, "rgba(200, 140, 255, 0.25)");
        coreGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
        context.fillStyle = coreGlow;
        context.fillRect(0, 0, width, height);

        // Nebula clouds along the arms
        nebulaClouds.forEach((cloud) => {
            const angle = cloud.angle + rotation;
            const distance = cloud.distanceRatio * galaxyRadius;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance * TILT;

            context.globalAlpha = cloud.alpha;
            context.drawImage(cloud.sprite, x - cloud.size, y - cloud.size * TILT, cloud.size * 2, cloud.size * 2 * TILT);
        });
        context.globalAlpha = 1;

        // Spiral arm stars
        galaxyStars.forEach((star) => {
            const angle = star.angle + rotation;
            const distance = star.distanceRatio * galaxyRadius;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance * TILT;

            context.fillStyle = star.color;
            context.fillRect(x, y, star.size, star.size);
        });
    }

    function animate(time) {
        draw(time);
        requestAnimationFrame(animate);
    }

    createStars();
    resize();
    window.addEventListener("resize", resize);

    // Respect users who ask for less motion: draw a single still frame
    if (!prefersReducedMotion) {
        requestAnimationFrame(animate);
    }
})();
