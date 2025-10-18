import type { Meta, StoryObj } from '@storybook/react'
import SupportPanel from '../components/organisms/SupportPanel'

const meta: Meta<typeof SupportPanel> = {
  title: 'Organisms/SupportPanel',
  component: SupportPanel,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
