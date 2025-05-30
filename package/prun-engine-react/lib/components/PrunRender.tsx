'use client';

import React from 'react';
import { useState } from 'react';
import { Stage, Sprite, SimpleMesh } from '@pixi/react';
import { Opi } from '../models/opi';
import { PrunEngine } from './PrunEngine';

const buildOpiMeshData = (
  nw: number[],
  size: number[],
  points: number[][],
  cells: number[][],
  scale: number,
) => {
  const w: number = size[0];
  const h: number = size[1];

  const uvs: number[] = [];
  const vers: number[] = [];
  const indices: number[] = [];
  points.forEach((e: number[]) => {
    vers.push((nw[0] + e[0]) * scale);
    vers.push((nw[1] + e[1]) * scale);
    uvs.push(e[0] / w);
    uvs.push(e[1] / h);
  });
  cells.forEach((e: number[]) => {
    indices.push(e[0]);
    indices.push(e[1]);
    indices.push(e[2]);
  });

  return {
    indices: new Uint16Array(indices),
    uvs: new Float32Array(uvs),
    vertices: new Float32Array(vers),
  };
};

export default function PrunRender(props: { opi: Opi; scale: number }) {
  const { uvs, vertices, indices } = buildOpiMeshData(
    props.opi.ankerNw,
    props.opi.maskSize,
    props.opi.points,
    props.opi.cells,
    props.scale,
  );
  const [_vertices, setVertices] = useState<Float32Array>(vertices);
  const length = _vertices.length;
  const dynamicPointLength = props.opi.dynamicPoints.length;

  const update = (updatedDynamicPoints: number[][]) => {
    if (_vertices) {
      const dst = _vertices.slice();
      for (let i = 0; i < dynamicPointLength; i += 1) {
        const [x, y] = updatedDynamicPoints[i];
        dst[length - 2 * dynamicPointLength + 2 * i] = x;
        dst[length - 2 * dynamicPointLength + 2 * i + 1] = y;
      }
      setVertices(dst);
    }
  };

  PrunEngine({ opi: props.opi, scale: props.scale, update: update });

  return (
    <>
      <Stage
        width={props.opi.thumbnailSize[0] * props.scale}
        height={props.opi.thumbnailSize[1] * props.scale}
        options={{
          backgroundAlpha: 0,
        }
        }
      >
        <Sprite
          image={props.opi.thumbnailPath}
          scale={{ x: 0.5, y: 0.5 }}
          width={props.opi.thumbnailSize[0] * props.scale}
          height={props.opi.thumbnailSize[1] * props.scale}
        />
        <SimpleMesh image={props.opi.maskPath} uvs={uvs} vertices={_vertices} indices={indices} />
      </Stage>
    </>
  );
}