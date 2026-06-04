import { useEffect } from 'react';
import { load } from '@2gis/mapgl';
import { FeatureCollection, GeoJsonProperties, Geometry, Point } from 'geojson';
import { useMapglContext } from './MapglContext';
import { useControlRotateClockwise } from './useControlRotateClockwise';
import { ControlRotateCounterclockwise } from './ControlRotateConterclockwise';
import { MapWrapper } from './MapWrapper';
import geoData from './data/kaluzhskaia-oblast.json';

const MAP_KEY = '98ba98a4-edaa-4d4c-ade3-cc41f0820be0';
const MAP_STYLE = '5be90997-755f-4127-b003-f8c0e2d2cce9';

export const MAP_CENTER = [36.261215, 54.513845];

export default function Mapgl() {
    const { setMapglContext } = useMapglContext();

    useEffect(() => {
        let map: mapgl.Map | undefined = undefined;
        let labels: mapgl.Label[] = [];

        load().then((mapgl) => {
            map = new mapgl.Map('map-container', {
                center: MAP_CENTER,
                zoom: 12,
                key: MAP_KEY,
                style: MAP_STYLE,
            });

            const data = geoData as FeatureCollection<Geometry, GeoJsonProperties>;

            new mapgl.GeoJsonSource(map, {
                data,
                attributes: {
                    visible: true,
                },
            });

            const heatmapLayer: any = {
                id: 'kaluga-dtp-heatmap-layer',
                filter: ['match', ['sourceAttr', 'visible'], [true], true, false],
                type: 'heatmap',
                style: {
                    color: [
                        'interpolate',
                        ['linear'],
                        ['heatmap-density'],
                        0,
                        'rgba(0, 0, 0, 0)',
                        0.18,
                        'rgba(19, 121, 117, 0.42)',
                        0.42,
                        'rgba(244, 196, 48, 0.72)',
                        0.68,
                        'rgba(237, 108, 52, 0.9)',
                        1,
                        'rgba(190, 29, 45, 1)',
                    ],
                    radius: ['interpolate', ['linear'], ['zoom'], 9, 12, 12, 22, 15, 34],
                    intensity: 0.85,
                    opacity: 0.82,
                    downscale: 1,
                },
            };

            map.on('styleload', () => {
                map?.addLayer(heatmapLayer);

                const labelFeatures = data.features
                    .filter((feature) => {
                        return feature.geometry?.type === 'Point' && feature.properties?.region === 'Калуга';
                    })
                    .slice(0, 80);

                labels = labelFeatures.map((feature, index) => {
                    const point = feature.geometry as Point;
                    const properties = feature.properties ?? {};
                    const weather = Array.isArray(properties.weather)
                        ? properties.weather.join(', ')
                        : 'погода не указана';
                    const category = properties.category ?? 'ДТП';
                    const severity = properties.severity ?? 'тяжесть не указана';
                    const injuredCount = properties.injured_count ?? 0;
                    const deadCount = properties.dead_count ?? 0;

                    return new mapgl.Label(map!, {
                        coordinates: point.coordinates,
                        text: `${category}\n${severity}; постр.: ${injuredCount}; погиб.: ${deadCount}\n${weather}`,
                        fontSize: 12,
                        color: '#fff7dc',
                        haloColor: '#2a1330',
                        haloRadius: 1,
                        minZoom: 12,
                        zIndex: index + 1,
                        offset: [0, -24],
                        labeling: {
                            type: 'pointLabelsOnly',
                        },
                        image: {
                            url: `${process.env.PUBLIC_URL}/label-bg.svg`,
                            size: [220, 104],
                            stretchX: [
                                [24, 92],
                                [128, 196],
                            ],
                            stretchY: [[22, 68]],
                            padding: [20, 24, 30, 24],
                        },
                    });
                });
            });

            setMapglContext({
                mapglInstance: map,
                mapgl,
            });
        });

        return () => {
            labels.forEach((label) => label.destroy());
            map && map.destroy();
            setMapglContext({ mapglInstance: undefined, mapgl: undefined });
        };
    }, [setMapglContext]);

    useControlRotateClockwise();

    return (
        <>
            <MapWrapper />
            <ControlRotateCounterclockwise />
        </>
    );
}
