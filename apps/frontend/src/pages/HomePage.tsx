import { Link } from 'react-router-dom'
import { BlurFade } from '@/components/magicui/blur-fade'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { MagicCard } from '@/components/magicui/magic-card'
import { Particles } from '@/components/magicui/particles'
import { WordRotate } from '@/components/magicui/word-rotate'
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text'
import { NumberTicker } from '@/components/magicui/number-ticker'

export function HomePage() {
  return (
    <div className="-mx-4 -mt-8 sm:-mx-6">
      {/* ── Hero Section ── */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 py-24 text-center">
        <Particles
          className="absolute inset-0"
          quantity={60}
          ease={80}
          color="var(--color-brand-500)"
          refresh
        />

        <div className="relative z-10 mx-auto max-w-3xl space-y-8">
          <BlurFade delay={0.1}>
            <AnimatedGradientText className="mx-auto">
              ⚽ <span className="ml-1">Sorteio inteligente de times</span>
            </AnimatedGradientText>
          </BlurFade>

          <BlurFade delay={0.25}>
            <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-6xl lg:text-7xl">
              Monte times{' '}
              <span className="bg-gradient-to-r from-[var(--color-brand-500)] to-[var(--color-brand-300)] bg-clip-text text-transparent">
                equilibrados
              </span>{' '}
              para sua{' '}
              <WordRotate
                words={['pelada', 'rachinha', 'partida']}
                className="bg-gradient-to-r from-[var(--color-accent-400)] to-[var(--color-accent-500)] bg-clip-text text-transparent"
              />
            </h1>
          </BlurFade>

          <BlurFade delay={0.4}>
            <p className="mx-auto max-w-lg text-lg text-[var(--text-secondary)]">
              Cadastre jogadores, avalie habilidades e gere times justos
              automaticamente com o algoritmo de balanceamento do{' '}
              <strong className="text-[var(--text-brand)]">dib.re</strong>.
            </p>
          </BlurFade>

          <BlurFade delay={0.55}>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/players">
                <ShimmerButton className="h-12 px-8 text-base font-semibold shadow-xl">
                  Ver jogadores
                </ShimmerButton>
              </Link>
              <Link
                to="/peladas"
                className="inline-flex h-12 items-center rounded-xl border border-[var(--border-secondary)] bg-[var(--surface-primary)] px-8 text-base font-semibold text-[var(--text-primary)] shadow-sm transition-all hover:bg-[var(--surface-tertiary)] hover:shadow-md"
              >
                Criar pelada
              </Link>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="border-y border-[var(--border-primary)] bg-[var(--surface-primary)] px-4 py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            { value: 5, label: 'Atributos avaliados', suffix: '' },
            { value: 5, label: 'Estrelas máximas', suffix: '★' },
            { value: 20, label: 'Times por pelada', suffix: '' },
            { value: 100, label: 'Balanceamento', suffix: '%' },
          ].map((stat, i) => (
            <BlurFade key={stat.label} delay={0.1 * i}>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-[var(--color-brand-600)]">
                  <NumberTicker value={stat.value} />
                  {stat.suffix}
                </p>
                <p className="mt-1 text-sm text-[var(--text-tertiary)]">{stat.label}</p>
              </div>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <BlurFade delay={0.1}>
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                Como funciona
              </h2>
              <p className="mt-3 text-[var(--text-secondary)]">
                Três passos simples para a pelada perfeita
              </p>
            </div>
          </BlurFade>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Cadastre jogadores',
                description:
                  'Adicione os jogadores com foto, estrelas de 1 a 5 e atributos técnicos como passe, chute, defesa, energia e velocidade.',
                icon: '👥',
                link: '/players',
              },
              {
                step: '2',
                title: 'Crie a pelada',
                description:
                  'Defina o nome da pelada e o número de times. Selecione os jogadores que vão participar da partida.',
                icon: '📋',
                link: '/peladas/new',
              },
              {
                step: '3',
                title: 'Sorteie os times',
                description:
                  'O algoritmo distribui os jogadores de forma equilibrada, garantindo que todos os times tenham médias similares.',
                icon: '🎲',
                link: '/peladas',
              },
            ].map((feature, i) => (
              <BlurFade key={feature.step} delay={0.15 + i * 0.1}>
                <Link to={feature.link}>
                  <MagicCard
                    className="flex h-full flex-col p-8 transition-shadow hover:shadow-lg"
                    gradientColor="var(--color-brand-100)"
                  >
                    <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--color-brand-50)] to-[var(--color-brand-100)] text-2xl">
                      {feature.icon}
                    </div>
                    <div className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--color-brand-500)]">
                      Passo {feature.step}
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-[var(--text-primary)]">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                      {feature.description}
                    </p>
                  </MagicCard>
                </Link>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="border-t border-[var(--border-primary)] bg-gradient-to-b from-[var(--surface-primary)] to-[var(--surface-secondary)] px-4 py-20 text-center">
        <BlurFade delay={0.1}>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Pronto para a próxima pelada?
          </h2>
          <p className="mx-auto max-w-md text-[var(--text-secondary)]">
            Faça login, cadastre seus jogadores e nunca mais tenha times desbalanceados.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/peladas/new">
              <ShimmerButton className="h-11 px-6 font-semibold shadow-lg">
                Criar pelada agora
              </ShimmerButton>
            </Link>
          </div>
        </BlurFade>
      </section>
    </div>
  )
}
