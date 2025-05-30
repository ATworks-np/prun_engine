'use client';

import { Engine, World, Runner, Bodies, Body, Constraint, Events } from 'matter-js';
import { useEffect, useRef } from 'react';
import { Opi } from '../models/opi';

export function PrunEngine(props: {
  opi: Opi;
  scale: number;
  update: (updatedDynamicPoints: number[][]) => void;
}) {
  const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const prevMouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const velocity = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const prevVelocity = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const prevUpdateTime = useRef<{ time: number }>({ time: 0 });
  const engine = useRef(Engine.create());
  const runner = useRef(Runner.create());

  useEffect(() => {
    Runner.run(runner.current, engine.current);

    engine.current.gravity.y = 0;

    const bodies: Matter.Body[] = [];
    props.opi.dynamicPoints.forEach((point: number[]) => {
      for (let i = 0; i < 2; i += 1) {
        const body = Bodies.circle(
          (props.opi.ankerNw[0] + point[0]) * props.scale,
          (props.opi.ankerNw[1] + point[1]) * props.scale,
          20,
          { isStatic: i === 0 },
        );
        body.collisionFilter = {
          group: -1,
        };
        bodies.push(body);
      }
    });
    World.add(engine.current.world, bodies);

    const springs = [];
    for (let i = 0; i < props.opi.dynamicPoints.length; i += 1) {
      const bodyA = bodies[2 * i];
      const bodyB = bodies[2 * i + 1];
      const spring = Constraint.create({
        bodyA,
        bodyB,
        stiffness: (2 + (Math.random() - 0.5)) * 0.004,
        damping: (Math.random() - 0.5) * 0.001,
      });
      springs.push(spring);
    }
    World.add(engine.current.world, springs);

    const handleScroll = () => {
      prevMouse.current.y = mouse.current.y;
      mouse.current.y = document.documentElement.scrollTop;
      prevVelocity.current.y = velocity.current.y;
      // MEMO: スクロールの速度を計算
      velocity.current.y = mouse.current.y - prevMouse.current.y;
      // MEMO: 速度の変化率に応じて重力を変更
      const gravityChangeRate = 0.01; // MEMO: 加速度1の時の重力
      const gravity = (velocity.current.y - prevVelocity.current.y) * gravityChangeRate;
      const clipedGravity = Math.min(Math.abs(gravity), 0.003);
      bodies.forEach((body) => {
        Body.applyForce(body, body.position, {
          x: 0,
          y: gravity > 0 ? clipedGravity : -clipedGravity,
        });
      });
    };
    window.addEventListener('scroll', handleScroll);

    Events.on(engine.current, 'afterUpdate', (event) => {
      const updateEvent = event;
      if (updateEvent.timestamp - prevUpdateTime.current.time > 1000 / 30) {
        const buf = bodies
          .filter((x, y) => y % 2 === 1)
          .map((body) => [body.position.x, body.position.y]);
        props.update(buf);
        prevUpdateTime.current.time = updateEvent.timestamp;
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}